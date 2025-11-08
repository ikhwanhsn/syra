import React from "react";
import {
  ArrowRight,
  CheckCircle,
  XCircle,
  Wallet,
  Server,
  Shield,
  Coins,
} from "lucide-react";

export default function X402FlowDiagram() {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          X402 Payment Protocol Flow
        </h1>
        <p className="text-slate-300 text-lg">
          Trading Signal Creation with Solana Payment
        </p>
      </div>

      {/* Step 1: Payment Quote Request */}
      <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center font-bold text-xl">
            1
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Client Requests Payment Quote
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 mb-3">
              <code className="text-sm text-green-400">
                GET /api/signal/create
              </code>
            </div>
            <p className="text-slate-300 mb-3">
              User clicks "Submit" → Client sends GET request without payment
            </p>
            <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3">
              <p className="text-sm font-semibold text-blue-300">
                Server Response (402 Payment Required):
              </p>
              <pre className="text-xs mt-2 text-slate-300 overflow-x-auto">
                {`{
  "x402Version": 1,
  "accepts": [{
    "scheme": "exact",
    "network": "solana-devnet",
    "maxAmountRequired": "100",
    "asset": "USDC_MINT_ADDRESS",
    "payTo": "TOKEN_ACCOUNT",
    "extra": {
      "recipientWallet": "SERVER_WALLET"
    }
  }]
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <ArrowRight className="w-8 h-8 text-purple-400" />
      </div>

      {/* Step 2: Build Transaction */}
      <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center font-bold text-xl">
            2
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Client Builds USDC Transfer Transaction
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-purple-300 mb-1">
                  ✓ Get token accounts
                </p>
                <p className="text-xs text-slate-400">
                  Derive sender & recipient token accounts from wallet addresses
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-purple-300 mb-1">
                  ✓ Check balances
                </p>
                <p className="text-xs text-slate-400">
                  Verify user has sufficient USDC (0.0001 USDC)
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-purple-300 mb-1">
                  ✓ Create transfer instruction
                </p>
                <p className="text-xs text-slate-400">
                  SPL Token transfer from user → server
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-purple-300 mb-1">
                  ✓ Simulate transaction
                </p>
                <p className="text-xs text-slate-400">
                  Test locally before asking user to sign
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <ArrowRight className="w-8 h-8 text-green-400" />
      </div>

      {/* Step 3: User Signs */}
      <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center font-bold text-xl">
            3
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              User Signs Transaction
            </h3>
            <div className="bg-slate-900 rounded-lg p-4">
              <p className="text-slate-300 mb-2">
                Wallet popup appears → User approves USDC transfer
              </p>
              <div className="bg-green-900/30 border border-green-700 rounded p-2">
                <p className="text-sm text-green-300">
                  ✓ Transaction signed by user's wallet
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <ArrowRight className="w-8 h-8 text-orange-400" />
      </div>

      {/* Step 4: Send with Payment Proof */}
      <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center font-bold text-xl">
            4
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Server className="w-5 h-5" />
              Client Sends Payment Proof to Server
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 mb-3">
              <code className="text-sm text-orange-400">
                POST /api/signal/create
              </code>
              <p className="text-xs text-slate-400 mt-2">
                Headers: X-Payment (base64 encoded)
              </p>
            </div>
            <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3">
              <p className="text-sm font-semibold text-orange-300 mb-2">
                X-Payment Header Content:
              </p>
              <pre className="text-xs text-slate-300 overflow-x-auto">
                {`{
  "x402Version": 1,
  "scheme": "exact",
  "network": "solana-devnet",
  "payer": "USER_WALLET_ADDRESS",
  "payload": {
    "serializedTransaction": "BASE64_TX"
  }
}`}
              </pre>
            </div>
            <div className="mt-3 bg-slate-900 rounded-lg p-3">
              <p className="text-sm font-semibold text-orange-300 mb-1">
                Request Body:
              </p>
              <p className="text-xs text-slate-400">
                Signal data (ticker, entry, stop loss, take profit)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <ArrowRight className="w-8 h-8 text-red-400" />
      </div>

      {/* Step 5: Server Verification */}
      <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-full flex items-center justify-center font-bold text-xl">
            5
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Server Verifies Payment
            </h3>
            <div className="space-y-3">
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  1. Deserialize transaction
                </p>
                <p className="text-xs text-slate-400">
                  Parse signed transaction from base64
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  2. Verify signature exists
                </p>
                <p className="text-xs text-slate-400">
                  Check transaction is signed by user
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  3. Validate USDC transfer
                </p>
                <p className="text-xs text-slate-400">
                  Verify destination = server & amount ≥ 100 (0.0001 USDC)
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  4. Simulate transaction
                </p>
                <p className="text-xs text-slate-400">
                  Test if transaction will succeed on-chain
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  5. Submit to blockchain
                </p>
                <p className="text-xs text-slate-400">
                  Send raw transaction to Solana
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  6. Wait for confirmation
                </p>
                <p className="text-xs text-slate-400">
                  Confirm transaction on-chain
                </p>
              </div>
              <div className="bg-slate-900 rounded-lg p-3">
                <p className="text-sm font-semibold text-red-300 mb-1">
                  7. Verify actual balance change
                </p>
                <p className="text-xs text-slate-400">
                  Check server received correct USDC amount
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <ArrowRight className="w-8 h-8 text-cyan-400" />
      </div>

      {/* Step 6: Success Response */}
      <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center font-bold text-xl">
            6
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Server Creates Signal & Returns Success
            </h3>
            <div className="bg-slate-900 rounded-lg p-4 mb-3">
              <p className="text-slate-300 mb-2">
                ✓ Payment verified → Signal saved to MongoDB
              </p>
            </div>
            <div className="bg-cyan-900/30 border border-cyan-700 rounded-lg p-3">
              <p className="text-sm font-semibold text-cyan-300 mb-2">
                Success Response (200):
              </p>
              <pre className="text-xs text-slate-300 overflow-x-auto">
                {`{
  "success": true,
  "message": "Signal created successfully!",
  "signal": {
    "wallet": "USER_WALLET",
    "signal": "Buy",
    "ticker": "BTC",
    "entryPrice": 50000,
    "status": "Pending",
    "paymentSignature": "TX_SIGNATURE",
    "paidAmount": 0.0001
  },
  "paymentDetails": {
    "signature": "TX_SIGNATURE",
    "explorerUrl": "https://explorer.solana.com/tx/..."
  }
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits Section */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
          <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
          <h4 className="font-semibold mb-1">Secure</h4>
          <p className="text-sm text-slate-300">
            Server verifies payment on-chain before creating signal
          </p>
        </div>
        <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <Shield className="w-8 h-8 text-blue-400 mb-2" />
          <h4 className="font-semibold mb-1">Transparent</h4>
          <p className="text-sm text-slate-300">
            All payments are verifiable on Solana blockchain
          </p>
        </div>
        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
          <Coins className="w-8 h-8 text-purple-400 mb-2" />
          <h4 className="font-semibold mb-1">Atomic</h4>
          <p className="text-sm text-slate-300">
            Payment and signal creation happen together
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-slate-400 text-sm">
        <p>
          X402 Protocol: HTTP 402 Payment Required standard for Web3 payments
        </p>
        <p className="mt-2">
          Network: Solana Devnet • Token: USDC • Price: 0.0001 USDC per signal
        </p>
      </div>
    </div>
  );
}
