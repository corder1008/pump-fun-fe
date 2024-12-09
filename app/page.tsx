"use client";
import { useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { Header } from "./components/Header";
import { Transaction, Connection, PublicKey } from "@solana/web3.js";
import { Loading } from "notiflix";
import { SpinWheel } from "./components/SpinWheel";

import "react-spin-wheel/dist/index.css";
import { createBuyInstruction, getTokenData } from "./utils/buyCoin";

export default function Home() {
  const [solAmount, setSolAmount] = useState("");
  const { connected, publicKey } = useWallet();
  const { sendTransaction } = useWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const predefinedAmounts = [0.1, 0.5, 1, 2, 5, 10];

  const normalizedPublicKey = publicKey
    ? new PublicKey(publicKey.toString())
    : null;

  const [txLogs, setTxLogs] = useState<
    Array<{ message: string; timestamp: string }>
  >([]);

  // Add this function to add logs
  const addLog = (message: string) => {
    setTxLogs((prev) => [
      ...prev,
      {
        message,
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  const shortenAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const buyCoin = () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!solAmount) {
      alert("Please enter an amount!");
      return;
    }

    setIsSpinning(true);
  };

  const handleTransaction = async (tokenAddress: string, amount: number) => {
    const txBuilder = new Transaction();
    const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);
    if (!connected || !publicKey) {
      alert("Please connect your wallet first!");
      return;
    }
    try {
      Loading.standard();
      const tokenData = await getTokenData(tokenAddress);
      console.log("tokenData:", tokenData["symbol"]);
      const instruction = await createBuyInstruction(
        normalizedPublicKey!,
        tokenAddress,
        amount,
        txBuilder,
        tokenData
      );
      txBuilder.add(instruction.instruction);
      txBuilder.feePayer = publicKey;

      try {
        const signature = await sendTransaction(txBuilder, connection);
        console.log("Transaction sent:", signature);

        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );
        console.log("Transaction confirmed:", confirmation);
        Loading.remove();
        const txUrl = `https://explorer.solana.com/tx/${signature}`;
        addLog(
          `You received ${instruction.tokenAmount} ${tokenData["symbol"]} tokens for ${amount} SOL - ${txUrl}`
        );
        alert("Purchase successful!");
      } catch (txError: any) {
        Loading.remove();
        if (txError.message.includes("User rejected")) {
          addLog("Transaction cancelled by user");
          console.log("User cancelled the transaction");
          return; // Exit gracefully
        }
        addLog(`Transaction failed: ${txError.message}`);
        throw txError;
      }
    } catch (error) {
      Loading.remove();
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

  const wheelItems = addresses.map((addr) => ({
    value: addr.value,
    tokenAddress: addr.id.tokenAddress,
  }));

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 gap-16 p-6 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-8 row-start-2 items-center w-full">
        <div className="wheel-container">
          <SpinWheel
            items={wheelItems}
            onFinishSpin={async (selectedItem) => {
              setIsSpinning(false);
              await handleTransaction(
                selectedItem.tokenAddress,
                parseFloat(solAmount)
              );
            }}
            isSpinning={isSpinning}
          />
        </div>
        <input
          type="number"
          placeholder="Enter SOL Amount"
          value={solAmount}
          onChange={(e) => setSolAmount(e.target.value)}
          className="border rounded p-2"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {predefinedAmounts.map((amount) => (
              <button
                key={amount}
                onClick={() => setSolAmount(amount.toString())}
                className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
              >
                {amount} SOL
              </button>
            ))}
          </div>
        </div>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={async () => buyCoin()}
        >
          {connected ? "Buy a Coin" : "Connect Wallet"}
        </button>
        <div className="w-full mt-8">
          <h3 className="text-lg font-semibold mb-2">Transaction Logs</h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-48 overflow-y-auto font-mono text-sm">
            {txLogs.length === 0 ? (
              <p className="text-gray-500">No transaction logs yet...</p>
            ) : (
              txLogs.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-gray-500">[{log.timestamp}]</span>{" "}
                  {log.message}
                </div>
              ))
            )}
          </div>
          {txLogs.length > 0 && (
            <button
              onClick={() => setTxLogs([])}
              className="mt-2 text-sm text-gray-500 hover:text-gray-400"
            >
              Clear logs
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
