"use client";
import { useEffect, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, SystemProgram, PublicKey } from "@solana/web3.js";
import { Header } from "./components/Header";
import { Transaction, ComputeBudgetProgram, Connection } from "@solana/web3.js";
import { SpinWheel } from "react-spin-wheel";

import "react-spin-wheel/dist/index.css";
import { createBuyInstruction } from "./utils/buyCoin";

export default function Home() {
  const [solAmount, setSolAmount] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedTokenAssociatedAddress, setSelectedTokenAssociatedAddress] =
    useState("");
  const { connected, publicKey } = useWallet();
  const { sendTransaction } = useWallet();

  useEffect(() => {
    console.log(selectedAddress);
  }, [selectedAddress]);

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const buyCoin = async (
    tokenAddress: string,
    tokenAssociatedAddress: string,
    amount: number
  ) => {
    console.log("tokenAddress:", tokenAddress);
    console.log("tokenAssociatedAddress:", tokenAssociatedAddress);
    console.log("amount:", amount);
    const txBuilder = new Transaction();
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    if (!connected || !publicKey) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      console.log("publicKey:", publicKey);
      const instruction = await createBuyInstruction(
        publicKey,
        tokenAddress,
        amount,
        txBuilder
      );
      console.log("instruction:", instruction);
      txBuilder.add(instruction.instruction);

      console.log("fee_address:", process.env.NEXT_PUBLIC_FEE_ADDRESS);
      console.log(
        "fee_address_amount:",
        process.env.NEXT_PUBLIC_FEE_ADDRESS_AMOUNT
      );

      txBuilder.feePayer = publicKey;

      console.log("txBuilder:", txBuilder);

      const signature = await sendTransaction(txBuilder, connection);
      console.log("Transaction sent:", signature);

      const confirmation = await connection.confirmTransaction(
        signature,
        "confirmed"
      );
      console.log("Transaction confirmed:", confirmation);

      alert("Purchase successful!");
    } catch (error) {
      console.error("Error:", error);
      throw error;
    }
  };

  const addresses = [
    {
      tokenAddress: "DMtU33EtxfmbjoPXTWxtFRZX6dtrKhHLPLa6jGwSpump", //success
      tokenAssociatedAddress: "2Wc6BTtpQUMswqsDkUrq9ecRR3BRy2Wmpnv6JQG7zjUK",
    },
    {
      tokenAddress: "D4Mt68yW3ApoULX6pUN3Z3i2ZQ1dcMdKsd3avn6x4khu", //success
      tokenAssociatedAddress: "3JrJmLK8c7gMj18jhn3pp9CDx3WTZQmrD71AcycyYCiL",
    },
    {
      tokenAddress: "2SXY8umYszctuC57TVPFZ2QmsmxjqPByvDWADtfZpump", //success
      tokenAssociatedAddress: "BMcnRaVwK2jHfHddz5N5bEy4HqwhEhag8yiNiMnxH5rk",
    },
    {
      tokenAddress: "FMw844LtAfuE3ndjuWBWECx7LQ82fWrHqp67dUoxpump", //success
      tokenAssociatedAddress: "41yJae7d4PL34i851K6BwC5iQvxZzNtS9fqqfMi6Lq4X",
    },
    {
      tokenAddress: "HoyGvKrq145nrNvqewPzUbzNyHayFsx6WSQ3hk2rpump", //success
      tokenAssociatedAddress: "49jardH1HcrP6k8Y16Dg7XEz6hz3SiftALKNht3aHzac",
    },
  ].map((address) => ({
    id: address, // original address for internal use
    value: shortenAddress(address.tokenAddress), // shortened address for display
    tokenAssociatedAddress: address.tokenAssociatedAddress,
  }));

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 gap-16 p-6 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-8 row-start-2 items-center ">
        <div className="wheel-container">
          <SpinWheel
            items={addresses.map((addr) => addr.value)}
            onFinishSpin={(item) => {
              const fullAddress = addresses.find(
                (addr) => addr.value === item
              )?.id;
              setSelectedAddress(fullAddress?.tokenAddress as string);
              setSelectedTokenAssociatedAddress(
                addresses.find((addr) => addr.value === item)
                  ?.tokenAssociatedAddress || ""
              );
            }}
            size={300}
          />
        </div>
        <input
          type="number"
          placeholder="Enter SOL Amount"
          value={solAmount}
          onChange={(e) => setSolAmount(e.target.value)}
          className="border rounded p-2"
        />
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={async () =>
            await buyCoin(
              selectedAddress,
              selectedTokenAssociatedAddress,
              parseFloat(solAmount)
            )
          }
        >
          {connected ? "Buy a Coin" : "Connect Wallet"}
        </button>
      </main>
    </div>
  );
}
