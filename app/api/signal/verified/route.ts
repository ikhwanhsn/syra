// import clientPromise from "@/lib/mongodb";
// import { ObjectId } from "mongodb";
// import { NextResponse } from "next/server";

// export async function GET(req: Request) {
//   try {
//     // store information signal that updated
//     let updatedSignalsFromPendingToActive = 0;
//     let updatedSignalsFromActiveToSuccess = 0;
//     let updatedSignalsFromActiveToFailed = 0;
//     // get all crypto price from binance api
//     const res = await fetch("https://api.binance.com/api/v3/ticker/price");
//     const data = await res.json();
//     // get all pending signal and update to active when verified
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
//     // update signal status to active when price reach entry price
//     for (const signal of signalsPending) {
//       const price = data.find(
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
//     // update signal status to success when price reach take profit price
//     const signalsActive = await db
//       .collection("signals")
//       .find({ status: "Active" })
//       .toArray();
//     if (signalsActive.length === 0) {
//       return NextResponse.json({ error: "No active signals" }, { status: 404 });
//     }
//     for (const signal of signalsActive) {
//       const price = data.find(
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
//     // update signal status to fail when price reach stop loss price
//     for (const signal of signalsActive) {
//       const price = data.find(
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

export async function GET(req: Request) {
  console.log("=== START /api/signal/verified ===");
  console.log("1. Environment:", process.env.NODE_ENV);
  console.log("2. Timestamp:", new Date().toISOString());

  try {
    // store information signal that updated
    let updatedSignalsFromPendingToActive = 0;
    let updatedSignalsFromActiveToSuccess = 0;
    let updatedSignalsFromActiveToFailed = 0;

    console.log("3. Fetching Binance prices...");
    // get all crypto price from binance api
    const res = await fetch("https://api.binance.com/api/v3/ticker/price");
    if (!res.ok) {
      throw new Error(`Binance API error: ${res.status}`);
    }
    const data = await res.json();
    console.log("4. Binance prices fetched:", data.length, "pairs");

    console.log("5. Connecting to MongoDB...");
    // get all pending signal and update to active when verified
    const client = await clientPromise;
    console.log("6. MongoDB connected");

    const db = client.db("syra");
    console.log("7. Database selected: syra");

    console.log("8. Querying pending signals...");
    const signalsPending = await db
      .collection("signals")
      .find({ status: "Pending" })
      .toArray();
    console.log("9. Found pending signals:", signalsPending.length);

    if (signalsPending.length === 0) {
      console.log("10. No pending signals, returning 404");
      return NextResponse.json(
        { error: "No pending signals" },
        { status: 404 }
      );
    }

    console.log("11. Processing pending signals...");
    // update signal status to active when price reach entry price
    for (const signal of signalsPending) {
      const price = data.find(
        (item: any) => item.symbol === `${signal.ticker}USDT`
      );
      if (price) {
        const currentPrice = Number(price.price);
        if (signal.signal === "Buy" && currentPrice <= signal.entryPrice) {
          const result = await db
            .collection("signals")
            .updateOne(
              { _id: new ObjectId(signal._id) },
              { $set: { status: "Active", updatedAt: new Date() } }
            );
          if (result.modifiedCount > 0) {
            updatedSignalsFromPendingToActive++;
          }
        } else if (
          signal.signal === "Sell" &&
          currentPrice >= signal.entryPrice
        ) {
          const result = await db
            .collection("signals")
            .updateOne(
              { _id: new ObjectId(signal._id) },
              { $set: { status: "Active", updatedAt: new Date() } }
            );
          if (result.modifiedCount > 0) {
            updatedSignalsFromPendingToActive++;
          }
        }
      }
    }
    console.log(
      "12. Pending to Active updates:",
      updatedSignalsFromPendingToActive
    );

    console.log("13. Querying active signals...");
    // update signal status to success when price reach take profit price
    const signalsActive = await db
      .collection("signals")
      .find({ status: "Active" })
      .toArray();
    console.log("14. Found active signals:", signalsActive.length);

    if (signalsActive.length === 0) {
      console.log("15. No active signals, returning 404");
      return NextResponse.json({ error: "No active signals" }, { status: 404 });
    }

    console.log("16. Processing active signals for take profit...");
    for (const signal of signalsActive) {
      const price = data.find(
        (item: any) => item.symbol === `${signal.ticker}USDT`
      );
      if (price) {
        const currentPrice = Number(price.price);
        if (signal.signal === "Buy" && currentPrice >= signal.takeProfit) {
          const result = await db
            .collection("signals")
            .updateOne(
              { _id: new ObjectId(signal._id) },
              { $set: { status: "Success", updatedAt: new Date() } }
            );
          if (result.modifiedCount > 0) {
            updatedSignalsFromActiveToSuccess++;
          }
        } else if (
          signal.signal === "Sell" &&
          currentPrice <= signal.takeProfit
        ) {
          const result = await db
            .collection("signals")
            .updateOne(
              { _id: new ObjectId(signal._id) },
              { $set: { status: "Success", updatedAt: new Date() } }
            );
          if (result.modifiedCount > 0) {
            updatedSignalsFromActiveToSuccess++;
          }
        }
      }
    }
    console.log(
      "17. Active to Success updates:",
      updatedSignalsFromActiveToSuccess
    );

    console.log("18. Processing active signals for stop loss...");
    // update signal status to fail when price reach stop loss price
    for (const signal of signalsActive) {
      const price = data.find(
        (item: any) => item.symbol === `${signal.ticker}USDT`
      );
      if (price) {
        const currentPrice = Number(price.price);
        if (signal.signal === "Buy" && currentPrice <= signal.stopLoss) {
          const result = await db
            .collection("signals")
            .updateOne(
              { _id: new ObjectId(signal._id) },
              { $set: { status: "Failed", updatedAt: new Date() } }
            );
          if (result.modifiedCount > 0) {
            updatedSignalsFromActiveToFailed++;
          }
        } else if (
          signal.signal === "Sell" &&
          currentPrice >= signal.stopLoss
        ) {
          const result = await db
            .collection("signals")
            .updateOne(
              { _id: new ObjectId(signal._id) },
              { $set: { status: "Failed", updatedAt: new Date() } }
            );
          if (result.modifiedCount > 0) {
            updatedSignalsFromActiveToFailed++;
          }
        }
      }
    }
    console.log(
      "19. Active to Failed updates:",
      updatedSignalsFromActiveToFailed
    );

    console.log("20. Returning success response");
    return NextResponse.json(
      {
        message: "Updated signals Successfully!",
        updatedSignalsFromPendingToActive,
        updatedSignalsFromActiveToSuccess,
        updatedSignalsFromActiveToFailed,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("=== ERROR in /api/signal/verified ===");
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );
    console.error(
      "Error stack:",
      error instanceof Error ? error.stack : "No stack trace"
    );

    return NextResponse.json(
      {
        error: "Failed to update signals",
        details: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}
