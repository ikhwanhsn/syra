import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    // store information signal that updated
    let updatedSignalsFromPendingToActive = 0;
    let updatedSignalsFromActiveToSuccess = 0;
    let updatedSignalsFromActiveToFailed = 0;
    // get all crypto price from binance api
    const res = await fetch("https://api.binance.com/api/v3/ticker/price");
    const data = await res.json();
    // get all pending signal and update to active when verified
    const client = await clientPromise;
    const db = client.db();
    const signalsPending = await db
      .collection("signals")
      .find({ status: "Pending" })
      .toArray();
    if (signalsPending.length === 0) {
      return NextResponse.json(
        { error: "No pending signals" },
        { status: 404 }
      );
    }
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
    // update signal status to success when price reach take profit price
    const signalsActive = await db
      .collection("signals")
      .find({ status: "Active" })
      .toArray();
    if (signalsActive.length === 0) {
      return NextResponse.json({ error: "No active signals" }, { status: 404 });
    }
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
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update signals" },
      { status: 500 }
    );
  }
}
