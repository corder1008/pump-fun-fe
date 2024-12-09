import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  SystemProgram,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import axios from "axios";

async function getTokenData(mintStr: string, retries = 3, delay = 6000) {
  const url = `/api/coins`;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await axios.post(url, { mintStr });

      if (response.status === 200) {
        return response.data;
      } else {
        console.log("Failed to retrieve coin data:", response.status);
      }
    } catch (error) {
      console.log("Error fetching coin data:", error);
    }

    if (attempt < retries - 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  return null;
}

function bufferFromUInt64(value: number | string) {
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64LE(BigInt(value));
  return buffer;
}

export const createBuyInstruction = async (
  walletPubkey: PublicKey,
  coinAddress: string,
  amount: number,
  txBuilder: Transaction
) => {
  console.log("params:", walletPubkey, coinAddress, amount);
  const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
  const coinPubkey = new PublicKey(coinAddress);

  const amountLamports = amount * LAMPORTS_PER_SOL;

  const tokenData = await getTokenData(coinAddress);

  console.log("tokenData:", tokenData, walletPubkey, coinPubkey);

  const GLOBAL = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf");
  const FEE_RECIPIENT = new PublicKey(
    "CebN5WGQ4jvEPvsVU4EoHEpgzq1VV7AbicfhtW4xC9iM"
  );
  const TOKEN_PROGRAM_ID = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );
  const RENT = new PublicKey("SysvarRent111111111111111111111111111111111");

  const Event_Authority = new PublicKey(
    "Ce6TQqeHC9p8KetsN6JsjHK7UTZk7nasjjnr7XxXp9F1"
  );
  const SYSTEM_PROGRAM_ID = SystemProgram.programId;
  const BONDING_CURVE = new PublicKey(tokenData["bonding_curve"]);
  const ASSOCIATED_BONDING_CURVE = new PublicKey(
    tokenData["associated_bonding_curve"]
  );

  const tokenAccountAddress = await getAssociatedTokenAddress(
    coinPubkey,
    walletPubkey,
    false
  );

  console.log("tokenAccountAddress:", tokenAccountAddress);

  const tokenAccountInfo = await connection.getAccountInfo(tokenAccountAddress);
  console.log("tokenAccountInfo:", tokenAccountInfo);

  let tokenAccount: PublicKey;

  if (!tokenAccountInfo) {
    console.log("Creating associated token account");
    txBuilder.add(
      createAssociatedTokenAccountInstruction(
        walletPubkey,
        tokenAccountAddress,
        walletPubkey,
        coinPubkey
      )
    );
    tokenAccount = await getAssociatedTokenAddress(
      coinPubkey,
      walletPubkey,
      false
    );
    console.log("Associated token account created", tokenAccount);
  } else {
    console.log("Token account already exists");
    tokenAccount = tokenAccountAddress;
  }

  const amountWithSlippage = amount * (1 + 0.25);
  const PUMP_FUN_PROGRAM = new PublicKey(
    "6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P"
  );
  const maxSolCost = Math.floor(amountWithSlippage * LAMPORTS_PER_SOL);
  const tokenOut = Math.floor(
    (amountLamports * tokenData["virtual_token_reserves"]) /
      tokenData["virtual_sol_reserves"]
  );

  console.log(
    "walletPubkey:",
    walletPubkey,
    new PublicKey(process.env.NEXT_PUBLIC_FEE_ADDRESS!)
  );

  const rentExemption = await connection.getMinimumBalanceForRentExemption(0);

  const fee_transaction = SystemProgram.transfer({
    fromPubkey: walletPubkey,
    toPubkey: new PublicKey(process.env.NEXT_PUBLIC_FEE_ADDRESS!),
    lamports:
      rentExemption +
      Math.floor(
        Number(process.env.NEXT_PUBLIC_FEE_ADDRESS_AMOUNT) * LAMPORTS_PER_SOL
      ),
  });
  txBuilder.add(fee_transaction);

  const ASSOCIATED_USER = tokenAccount;
  const instruction = new TransactionInstruction({
    programId: PUMP_FUN_PROGRAM,
    keys: [
      { pubkey: GLOBAL, isSigner: false, isWritable: false },
      { pubkey: FEE_RECIPIENT, isSigner: false, isWritable: true },
      { pubkey: coinPubkey, isSigner: false, isWritable: false },
      { pubkey: BONDING_CURVE, isSigner: false, isWritable: true },
      { pubkey: ASSOCIATED_BONDING_CURVE, isSigner: false, isWritable: true },
      {
        pubkey: ASSOCIATED_USER,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: walletPubkey, isSigner: false, isWritable: true },
      { pubkey: SYSTEM_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: RENT, isSigner: false, isWritable: false },
      { pubkey: Event_Authority, isSigner: false, isWritable: false },
      { pubkey: PUMP_FUN_PROGRAM, isSigner: false, isWritable: false },
    ],
    data: Buffer.concat([
      bufferFromUInt64("16927863322537952870"),
      bufferFromUInt64(tokenOut),
      bufferFromUInt64(maxSolCost),
    ]),
  });
  return { instruction: instruction, tokenAmount: tokenOut };
};
