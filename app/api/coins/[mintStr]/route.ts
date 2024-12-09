import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { mintStr: string } }
) {
  try {
    const response = await fetch(
      `https://frontend-api.pump.fun/coins/${params.mintStr}`
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch coin data" },
      { status: 500 }
    );
  }
}
