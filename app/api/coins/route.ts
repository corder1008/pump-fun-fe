import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { mintStr } = await request.json();

    if (!mintStr) {
      return NextResponse.json(
        { error: "mintStr is required" },
        { status: 400 }
      );
    }

    const response = await fetch(
      `https://frontend-api.pump.fun/coins/${mintStr}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch coin data" },
      { status: 500 }
    );
  }
}
