import { NextResponse } from "next/server";

// app/api/test-binance/route.ts
export async function GET() {
  try {
    const res = await fetch("https://api.binance.com/api/v3/ticker/price");
    const data = await res.json();
    return NextResponse.json({ success: true, count: data.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
