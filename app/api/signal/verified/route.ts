// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";
// import { NextResponse } from "next/server";

// export async function POST(req: Request) {
//   try {
//     // const { prices } = await req.json();

//     const pricesFetch = await fetch(
//       `https://api.binance.com/api/v3/ticker/price`
//     );
//     const prices = await pricesFetch.json();

//     if (!prices || !Array.isArray(prices)) {
//       return NextResponse.json(
//         { error: "Prices data is required" },
//         { status: 400 }
//       );
//     }

//     console.log("Received prices:", prices.length, "pairs");

//     let updatedSignalsFromPendingToActive = 0;
//     let updatedSignalsFromActiveToSuccess = 0;
//     let updatedSignalsFromActiveToFailed = 0;

//     const client = await clientPromise;
//     const db = client.db("syra");

//     const signalsPending = await db
//       .collection("signals")
//       .find({ status: "Pending" })
//       .toArray();

//     if (signalsPending.length === 0) {
//       return NextResponse.json(
//         { error: "No pending signals" },
//         { status: 404 }
//       );
//     }

//     // Use the prices passed from client
//     for (const signal of signalsPending) {
//       const price = prices.find(
//         (item: any) => item.symbol === `${signal.ticker}USDT`
//       );
//       if (price) {
//         const currentPrice = Number(price.price);
//         if (signal.signal === "Buy" && currentPrice <= signal.entryPrice) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Active", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromPendingToActive++;
//           }
//         } else if (
//           signal.signal === "Sell" &&
//           currentPrice >= signal.entryPrice
//         ) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Active", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromPendingToActive++;
//           }
//         }
//       }
//     }

//     const signalsActive = await db
//       .collection("signals")
//       .find({ status: "Active" })
//       .toArray();

//     if (signalsActive.length === 0) {
//       return NextResponse.json({ error: "No active signals" }, { status: 404 });
//     }

//     for (const signal of signalsActive) {
//       const price = prices.find(
//         (item: any) => item.symbol === `${signal.ticker}USDT`
//       );
//       if (price) {
//         const currentPrice = Number(price.price);
//         if (signal.signal === "Buy" && currentPrice >= signal.takeProfit) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Success", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToSuccess++;
//           }
//         } else if (
//           signal.signal === "Sell" &&
//           currentPrice <= signal.takeProfit
//         ) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Success", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToSuccess++;
//           }
//         }
//       }
//     }

//     for (const signal of signalsActive) {
//       const price = prices.find(
//         (item: any) => item.symbol === `${signal.ticker}USDT`
//       );
//       if (price) {
//         const currentPrice = Number(price.price);
//         if (signal.signal === "Buy" && currentPrice <= signal.stopLoss) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Failed", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToFailed++;
//           }
//         } else if (
//           signal.signal === "Sell" &&
//           currentPrice >= signal.stopLoss
//         ) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Failed", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToFailed++;
//           }
//         }
//       }
//     }

//     return NextResponse.json(
//       {
//         message: "Updated signals Successfully!",
//         updatedSignalsFromPendingToActive,
//         updatedSignalsFromActiveToSuccess,
//         updatedSignalsFromActiveToFailed,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to update signals" },
//       { status: 500 }
//     );
//   }
// }

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const pricesFetch = await fetch(
      `https://api.binance.com/api/v3/ticker/price`
    );
    const prices = await pricesFetch.json();

    if (!prices || !Array.isArray(prices)) {
      return NextResponse.json(
        { error: "Prices data is required" },
        { status: 400 }
      );
    }

    console.log("Received prices:", prices.length, "pairs");

    const client = await clientPromise;
    const db = client.db("syra");

    // Get all signals at once
    const [signalsPending, signalsActive] = await Promise.all([
      db.collection("signals").find({ status: "Pending" }).toArray(),
      db.collection("signals").find({ status: "Active" }).toArray(),
    ]);

    // Create price lookup map for faster searching
    const priceMap = new Map(
      prices.map((item: any) => [item.symbol, Number(item.price)])
    );

    // Batch updates
    const bulkPendingOps = [];
    const bulkSuccessOps = [];
    const bulkFailedOps = [];

    // Process Pending → Active
    for (const signal of signalsPending) {
      const currentPrice = priceMap.get(`${signal.ticker}USDT`);
      if (!currentPrice) continue;

      const shouldActivate =
        (signal.signal === "Buy" && currentPrice <= signal.entryPrice) ||
        (signal.signal === "Sell" && currentPrice >= signal.entryPrice);

      if (shouldActivate) {
        bulkPendingOps.push({
          updateOne: {
            filter: { _id: new ObjectId(signal._id) },
            update: { $set: { status: "Active", updatedAt: new Date() } },
          },
        });
      }
    }

    // Process Active → Success or Failed
    for (const signal of signalsActive) {
      const currentPrice = priceMap.get(`${signal.ticker}USDT`);
      if (!currentPrice) continue;

      // Check Success
      const hitTakeProfit =
        (signal.signal === "Buy" && currentPrice >= signal.takeProfit) ||
        (signal.signal === "Sell" && currentPrice <= signal.takeProfit);

      if (hitTakeProfit) {
        bulkSuccessOps.push({
          updateOne: {
            filter: { _id: new ObjectId(signal._id) },
            update: { $set: { status: "Success", updatedAt: new Date() } },
          },
        });
        continue; // Don't check stop loss
      }

      // Check Failed
      const hitStopLoss =
        (signal.signal === "Buy" && currentPrice <= signal.stopLoss) ||
        (signal.signal === "Sell" && currentPrice >= signal.stopLoss);

      if (hitStopLoss) {
        bulkFailedOps.push({
          updateOne: {
            filter: { _id: new ObjectId(signal._id) },
            update: { $set: { status: "Failed", updatedAt: new Date() } },
          },
        });
      }
    }

    // Execute all bulk operations
    const results = await Promise.all([
      bulkPendingOps.length > 0
        ? db.collection("signals").bulkWrite(bulkPendingOps)
        : Promise.resolve({ modifiedCount: 0 }),
      bulkSuccessOps.length > 0
        ? db.collection("signals").bulkWrite(bulkSuccessOps)
        : Promise.resolve({ modifiedCount: 0 }),
      bulkFailedOps.length > 0
        ? db.collection("signals").bulkWrite(bulkFailedOps)
        : Promise.resolve({ modifiedCount: 0 }),
    ]);

    return NextResponse.json(
      {
        message: "Updated signals Successfully!",
        updatedSignalsFromPendingToActive: results[0].modifiedCount,
        updatedSignalsFromActiveToSuccess: results[1].modifiedCount,
        updatedSignalsFromActiveToFailed: results[2].modifiedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update signals" },
      { status: 500 }
    );
  }
}

// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";
// import { NextResponse } from "next/server";

// export async function POST() {
//   try {
//     const client = await clientPromise;
//     const db = client.db("syra");

//     // === Step 1: Get all unique tickers from DB ===
//     const tickers = await db.collection("signals").distinct("ticker");

//     if (tickers.length === 0) {
//       return NextResponse.json({ error: "No tickers found" }, { status: 404 });
//     }

//     // === Step 2: Map ticker → CoinGecko ID ===
//     const symbolToId: Record<string, string> = {
//       BTC: "bitcoin",
//       ETH: "ethereum",
//       SOL: "solana",
//       BNB: "binancecoin",
//       AVAX: "avalanche-2",
//       ADA: "cardano",
//       DOGE: "dogecoin",
//       DOT: "polkadot",
//       LINK: "chainlink",
//       TON: "the-open-network",
//       XRP: "ripple",
//       MATIC: "matic-network",
//       UNI: "uniswap",
//       ATOM: "cosmos",
//       LTC: "litecoin",
//     };

//     const ids = tickers
//       .map((t) => symbolToId[t])
//       .filter(Boolean)
//       .join(",");

//     if (!ids) {
//       return NextResponse.json(
//         { error: "No supported tickers for CoinGecko" },
//         { status: 400 }
//       );
//     }

//     // === Step 3: Fetch live prices from CoinGecko ===
//     const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
//     const response = await fetch(coingeckoUrl, {
//       method: "GET",
//       headers: {
//         "x-cg-pro-api-key": process.env.COINGECKO_API_KEY || "",
//       },
//     });

//     if (!response.ok) {
//       throw new Error(`CoinGecko API error: ${response.status}`);
//     }

//     const data = await response.json();

//     // === Step 4: Convert CoinGecko format → your format ===
//     const prices = Object.entries(data)
//       .map(([id, value]: [string, any]) => {
//         const symbol = Object.keys(symbolToId).find(
//           (key) => symbolToId[key] === id
//         );
//         if (!symbol || !value.usd) return null;
//         return {
//           symbol: `${symbol}USDT`,
//           price: value.usd,
//         };
//       })
//       .filter(Boolean);

//     console.log("Received prices:", prices.length, "pairs");

//     if (prices.length === 0) {
//       return NextResponse.json(
//         { error: "No prices fetched from CoinGecko" },
//         { status: 500 }
//       );
//     }

//     // === Step 5: Process signals using YOUR WORKING LOGIC ===
//     let updatedSignalsFromPendingToActive = 0;
//     let updatedSignalsFromActiveToSuccess = 0;
//     let updatedSignalsFromActiveToFailed = 0;

//     const signalsPending = await db
//       .collection("signals")
//       .find({ status: "Pending" })
//       .toArray();

//     if (signalsPending.length === 0) {
//       return NextResponse.json(
//         { error: "No pending signals" },
//         { status: 404 }
//       );
//     }

//     // Pending → Active (YOUR WORKING LOGIC)
//     for (const signal of signalsPending) {
//       const price = prices.find(
//         (item: any) => item.symbol === `${signal.ticker}USDT`
//       );
//       if (price) {
//         const currentPrice = Number(price.price);
//         if (signal.signal === "Buy" && currentPrice <= signal.entryPrice) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Active", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromPendingToActive++;
//           }
//         } else if (
//           signal.signal === "Sell" &&
//           currentPrice >= signal.entryPrice
//         ) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Active", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromPendingToActive++;
//           }
//         }
//       }
//     }

//     const signalsActive = await db
//       .collection("signals")
//       .find({ status: "Active" })
//       .toArray();

//     if (signalsActive.length === 0) {
//       return NextResponse.json({ error: "No active signals" }, { status: 404 });
//     }

//     // Active → Success (YOUR WORKING LOGIC)
//     for (const signal of signalsActive) {
//       const price = prices.find(
//         (item: any) => item.symbol === `${signal.ticker}USDT`
//       );
//       if (price) {
//         const currentPrice = Number(price.price);
//         if (signal.signal === "Buy" && currentPrice >= signal.takeProfit) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Success", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToSuccess++;
//           }
//         } else if (
//           signal.signal === "Sell" &&
//           currentPrice <= signal.takeProfit
//         ) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Success", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToSuccess++;
//           }
//         }
//       }
//     }

//     // Active → Failed (YOUR WORKING LOGIC)
//     for (const signal of signalsActive) {
//       const price = prices.find(
//         (item: any) => item.symbol === `${signal.ticker}USDT`
//       );
//       if (price) {
//         const currentPrice = Number(price.price);
//         if (signal.signal === "Buy" && currentPrice <= signal.stopLoss) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Failed", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToFailed++;
//           }
//         } else if (
//           signal.signal === "Sell" &&
//           currentPrice >= signal.stopLoss
//         ) {
//           const result = await db
//             .collection("signals")
//             .updateOne(
//               { _id: new ObjectId(signal._id) },
//               { $set: { status: "Failed", updatedAt: new Date() } }
//             );
//           if (result.modifiedCount > 0) {
//             updatedSignalsFromActiveToFailed++;
//           }
//         }
//       }
//     }

//     return NextResponse.json(
//       {
//         message: "Updated signals Successfully!",
//         updatedSignalsFromPendingToActive,
//         updatedSignalsFromActiveToSuccess,
//         updatedSignalsFromActiveToFailed,
//         fetchedPrices: prices.length,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "Failed to update signals" },
//       { status: 500 }
//     );
//   }
// }
