import { NextResponse } from "next/server";
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
export async function POST(request: Request) {
  try {
    const { walletPubkey, address, amount } = await request.json();
    console.log(walletPubkey, address, amount);
    const programId = new PublicKey(
      process.env.NEXT_PUBLIC_PUMP_FUN_PROGRAM_ID!
    );
    const coinPubkey = new PublicKey(address);

    return new TransactionInstruction({
      programId,
      keys: [
        { pubkey: walletPubkey, isSigner: true, isWritable: true },
        { pubkey: coinPubkey, isSigner: false, isWritable: true },
      ],
      data: Buffer.from([0]), // Instruction index for 'buy'
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
