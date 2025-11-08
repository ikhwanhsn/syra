import { NextRequest, NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from "@solana/spl-token";
import clientPromise from "@/lib/mongodb";

const connection = new Connection("https://api.devnet.solana.com", "confirmed");

// Devnet USDC
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");

// Your server's wallet (receives payments)
const SERVER_WALLET = new PublicKey(
  "Cp5yFGYx88EEuUjhDAaQzXHrgxvVeYEWixtRnLFE81K4"
);

// Price per signal creation
const PRICE_PER_SIGNAL = 100; // 0.0001 USDC (100 = 0.0001 USDC with 6 decimals)

export async function GET(req: NextRequest) {
  return handleRequest(req);
}

export async function POST(req: NextRequest) {
  return handleRequest(req);
}

async function handleRequest(req: NextRequest) {
  const xPaymentHeader = req.headers.get("X-Payment");

  // Get server's USDC token account
  const SERVER_TOKEN_ACCOUNT = await getAssociatedTokenAddress(
    USDC_MINT,
    SERVER_WALLET
  );

  // ============================================
  // WITH PAYMENT: Verify and create signal
  // ============================================
  if (xPaymentHeader) {
    try {
      // Parse payment proof
      const paymentData = JSON.parse(
        Buffer.from(xPaymentHeader, "base64").toString("utf-8")
      );

      console.log("📩 Received payment proof");
      console.log("Network:", paymentData.network);

      // Deserialize transaction - handle both legacy and versioned transactions
      const txBuffer = Buffer.from(
        paymentData.payload.serializedTransaction,
        "base64"
      );

      let tx: Transaction | VersionedTransaction;
      let isVersioned = false;

      try {
        // Try to deserialize as versioned transaction first
        tx = VersionedTransaction.deserialize(txBuffer);
        isVersioned = true;
        console.log("📦 Versioned transaction detected");
      } catch {
        // Fall back to legacy transaction
        tx = Transaction.from(txBuffer);
        console.log("📦 Legacy transaction detected");
      }

      // VERIFY: Check if transaction is already signed
      if (isVersioned) {
        const vTx = tx as VersionedTransaction;
        if (
          vTx.signatures.length === 0 ||
          vTx.signatures.every((sig) => sig.every((b) => b === 0))
        ) {
          return NextResponse.json(
            { error: "Transaction must be signed by sender" },
            { status: 402 }
          );
        }
      } else {
        const legacyTx = tx as Transaction;
        if (!legacyTx.signature || legacyTx.signature.every((b) => b === 0)) {
          return NextResponse.json(
            { error: "Transaction must be signed by sender" },
            { status: 402 }
          );
        }
      }

      // VERIFY: Check if transaction sends USDC to us
      console.log("🔍 Verifying USDC transfer...");
      let validTransfer = false;
      let transferAmount = 0;
      let senderTokenAccount: PublicKey | null = null;

      const instructions = isVersioned
        ? (tx as VersionedTransaction).message.compiledInstructions
        : (tx as Transaction).instructions;

      if (isVersioned) {
        // Handle versioned transaction
        const vTx = tx as VersionedTransaction;
        const accountKeys = vTx.message.staticAccountKeys;

        for (const ix of vTx.message.compiledInstructions) {
          const programId = accountKeys[ix.programIdIndex];

          if (programId.equals(TOKEN_PROGRAM_ID)) {
            const data = ix.data;
            // Check if it's a Transfer instruction (type = 3)
            if (data.length >= 9 && data[0] === 3) {
              transferAmount = Number(
                Buffer.from(data.slice(1, 9)).readBigUInt64LE(0)
              );

              // Verify destination and amount
              if (ix.accountKeyIndexes.length >= 2) {
                const sourceAccountIndex = ix.accountKeyIndexes[0];
                const destAccountIndex = ix.accountKeyIndexes[1];

                const destAccount = accountKeys[destAccountIndex];
                senderTokenAccount = accountKeys[sourceAccountIndex];

                if (
                  destAccount.equals(SERVER_TOKEN_ACCOUNT) &&
                  transferAmount >= PRICE_PER_SIGNAL
                ) {
                  validTransfer = true;
                  console.log(
                    `✅ Valid transfer: ${transferAmount / 1000000} USDC`
                  );
                  break;
                }
              }
            }
          }
        }
      } else {
        // Handle legacy transaction
        const legacyTx = tx as Transaction;

        for (const ix of legacyTx.instructions) {
          if (ix.programId.equals(TOKEN_PROGRAM_ID)) {
            // Check if it's a Transfer instruction (type = 3)
            if (ix.data.length >= 9 && ix.data[0] === 3) {
              transferAmount = Number(ix.data.readBigUInt64LE(1));

              // Verify destination and amount
              if (ix.keys.length >= 2) {
                const destAccount = ix.keys[1].pubkey;
                senderTokenAccount = ix.keys[0].pubkey;

                if (
                  destAccount.equals(SERVER_TOKEN_ACCOUNT) &&
                  transferAmount >= PRICE_PER_SIGNAL
                ) {
                  validTransfer = true;
                  console.log(
                    `✅ Valid transfer: ${transferAmount / 1000000} USDC`
                  );
                  break;
                }
              }
            }
          }
        }
      }

      if (!validTransfer) {
        return NextResponse.json(
          {
            error: "Invalid payment transaction - no valid USDC transfer found",
          },
          { status: 402 }
        );
      }

      // SIMULATE: Test transaction before submitting
      console.log("🧪 Simulating transaction...");

      let simulation;
      if (isVersioned) {
        simulation = await connection.simulateTransaction(
          tx as VersionedTransaction,
          {
            commitment: "confirmed",
          }
        );
      } else {
        // For legacy transactions, use the first overload (no config object)
        simulation = await connection.simulateTransaction(tx as Transaction);
      }

      if (simulation.value.err) {
        console.error("❌ Simulation error:", simulation.value.err);
        console.error("Logs:", simulation.value.logs);

        return NextResponse.json(
          {
            error: "Transaction simulation failed",
            details: simulation.value.err,
            logs: simulation.value.logs,
          },
          { status: 402 }
        );
      }

      console.log("✅ Simulation successful");
      console.log("Logs:", simulation.value.logs);

      // SUBMIT: Send to blockchain
      console.log("📤 Submitting transaction...");
      const signature = await connection.sendRawTransaction(txBuffer, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 3,
      });

      console.log("📝 Transaction signature:", signature);

      // WAIT: For confirmation with timeout
      console.log("⏳ Waiting for confirmation...");
      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );

      if (confirmation.value.err) {
        console.error("❌ Confirmation error:", confirmation.value.err);
        return NextResponse.json(
          {
            error: "Transaction failed on-chain",
            details: confirmation.value.err,
          },
          { status: 402 }
        );
      }

      console.log("✅ Transaction confirmed");

      // VERIFY: Check actual balance change
      const confirmedTx = await connection.getTransaction(signature, {
        commitment: "confirmed",
        maxSupportedTransactionVersion: 0,
      });

      if (!confirmedTx) {
        return NextResponse.json(
          { error: "Could not fetch confirmed transaction" },
          { status: 402 }
        );
      }

      const postTokenBalances = confirmedTx.meta?.postTokenBalances ?? [];
      const preTokenBalances = confirmedTx.meta?.preTokenBalances ?? [];

      let amountReceived = 0;
      for (const postBal of postTokenBalances) {
        const preBal = preTokenBalances.find(
          (pre) => pre.accountIndex === postBal.accountIndex
        );

        const accountKey =
          confirmedTx.transaction.message.staticAccountKeys[
            postBal.accountIndex
          ];

        if (accountKey && accountKey.equals(SERVER_TOKEN_ACCOUNT)) {
          const postAmount = postBal.uiTokenAmount.amount;
          const preAmount = preBal?.uiTokenAmount.amount ?? "0";
          amountReceived = Number(postAmount) - Number(preAmount);
          break;
        }
      }

      if (amountReceived < PRICE_PER_SIGNAL) {
        return NextResponse.json(
          {
            error: `Insufficient payment received. Expected ${PRICE_PER_SIGNAL}, got ${amountReceived}`,
          },
          { status: 402 }
        );
      }

      // ✅ PAYMENT VERIFIED! CREATE SIGNAL
      console.log(`💰 Payment verified: ${amountReceived / 1000000} USDC`);

      // Parse signal data from request body
      const {
        wallet,
        signal,
        token,
        ticker,
        entryPrice,
        stopLoss,
        takeProfit,
      } = await req.json();

      const newSignal = {
        wallet,
        signal,
        token,
        ticker,
        entryPrice,
        stopLoss,
        takeProfit,
        status: "Pending",
        createdAt: new Date(),
        paymentSignature: signature,
        // linkSolscan: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        paidAmount: amountReceived / 1000000,
      };

      const client = await clientPromise;
      const db = client.db("syra");
      const createSignal = await db.collection("signals").insertOne(newSignal);

      if (!createSignal.acknowledged) {
        return NextResponse.json(
          { error: "Signal creation failed in database" },
          { status: 500 }
        );
      }

      console.log("🎯 Signal created successfully");

      // Return success with signal details
      return NextResponse.json({
        success: true,
        message: "Signal created successfully!",
        signal: {
          ...newSignal,
          _id: createSignal.insertedId,
        },
        paymentDetails: {
          signature,
          amount: amountReceived,
          amountUSDC: amountReceived / 1000000,
          recipient: SERVER_TOKEN_ACCOUNT.toBase58(),
          explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`,
        },
      });
    } catch (error) {
      console.error("❌ Payment verification error:", error);
      return NextResponse.json(
        {
          error: "Payment verification failed",
          details: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
        },
        { status: 402 }
      );
    }
  }

  // ============================================
  // NO PAYMENT: Return payment quote (402)
  // ============================================
  console.log("💳 New payment quote requested");

  // return NextResponse.json(
  //   {
  //     x402Version: 1, // ADD: Required version field
  //     accepts: [
  //       // CHANGE: 'payment' → 'accepts' array
  //       {
  //         scheme: "exact",
  //         network: "solana-devnet", // CHANGE: Specify network format
  //         maxAmountRequired: PRICE_PER_SIGNAL.toString(), // CHANGE: Must be string
  //         resource: "/api/signal/create", // ADD: Your endpoint path
  //         description: "Pay to create trading signal",
  //         mimeType: "application/json", // ADD: Content type
  //         payTo: SERVER_TOKEN_ACCOUNT.toBase58(), // CHANGE: Use token account
  //         maxTimeoutSeconds: 300, // ADD: Timeout (e.g., 5 minutes)
  //         asset: USDC_MINT.toBase58(), // ADD: Token mint address

  //         extra: {
  //           recipientWallet: SERVER_WALLET.toBase58(), // ADD THIS
  //         },

  //         // ADD: Optional schema for better documentation
  //         outputSchema: {
  //           input: {
  //             type: "http",
  //             method: "POST",
  //             bodyType: "json",
  //             bodyFields: {
  //               wallet: {
  //                 type: "string",
  //                 required: true,
  //                 description: "Wallet address",
  //               },
  //               signal: {
  //                 type: "string",
  //                 required: true,
  //                 description: "Signal type (e.g., BUY/SELL)",
  //               },
  //               token: {
  //                 type: "string",
  //                 required: true,
  //                 description: "Token address",
  //               },
  //               ticker: {
  //                 type: "string",
  //                 required: true,
  //                 description: "Token ticker symbol",
  //               },
  //               entryPrice: {
  //                 type: "number",
  //                 required: true,
  //                 description: "Entry price",
  //               },
  //               stopLoss: {
  //                 type: "number",
  //                 required: true,
  //                 description: "Stop loss price",
  //               },
  //               takeProfit: {
  //                 type: "number",
  //                 required: true,
  //                 description: "Take profit price",
  //               },
  //             },
  //           },
  //         },
  //       },
  //     ],
  //   },
  //   { status: 402 }
  // );

  return NextResponse.json(
    {
      x402Version: 1, // ADD: Required version field
      error: "X-PAYMENT header is required",
      accepts: [
        // CHANGE: 'payment' → 'accepts' array
        {
          scheme: "exact",
          network: "solana-devnet", // CHANGE: Specify network format
          maxAmountRequired: PRICE_PER_SIGNAL.toString(), // CHANGE: Must be string
          resource: "/api/signal/create", // ADD: Your endpoint path
          description: "Pay to create trading signal",
          mimeType: "application/json", // ADD: Content type
          payTo: SERVER_TOKEN_ACCOUNT.toBase58(), // CHANGE: Use token account
          maxTimeoutSeconds: 300, // ADD: Timeout (e.g., 5 minutes)
          asset: USDC_MINT.toBase58(), // ADD: Token mint address
          outputSchema: null,

          extra: {
            recipientWallet: SERVER_WALLET.toBase58(), // ADD THIS
          },
        },
      ],
    },
    { status: 402 }
  );
}
