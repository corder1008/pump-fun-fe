"use client";
import { useEffect, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { Header } from "../components/Header";
import { Transaction, Connection, PublicKey } from "@solana/web3.js";
import { Loading } from "notiflix";
import { SpinWheel } from "../components/SpinWheel";
import Image from "next/image";

import "react-spin-wheel/dist/index.css";
import { createBuyInstruction, getTokenData } from "../utils/buyCoin";

export default function Home() {
  const [solAmount, setSolAmount] = useState("");
  const { connected, publicKey } = useWallet();
  const { sendTransaction } = useWallet();
  const [isSpinning, setIsSpinning] = useState(false);
  const predefinedAmounts = [0.1, 0.5, 1, 2, 5, 10];
  const [selectedAddress, setSelectedAddress] = useState("");
  const [totalSpins, setTotalSpins] = useState(0);

  useEffect(() => {
    setTotalSpins(0);
  }, []);

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

  const buyCoin = async () => {
    if (!connected || !publicKey) {
      alert("Please connect your wallet first!");
      return;
    }
    if (!solAmount) {
      alert("Please enter an amount!");
      return;
    }

    try {
      // Randomly select a token address
      const randomIndex = Math.floor(Math.random() * addresses.length);
      const selectedToken = addresses[randomIndex];

      Loading.standard();

      // Perform the transaction
      const txBuilder = new Transaction();
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL!);

      const tokenData = await getTokenData(selectedToken.id.tokenAddress);
      console.log("tokenDataAddress", selectedToken.id.tokenAddress);
      // After successful transaction, start the spin animation

      const instruction = await createBuyInstruction(
        normalizedPublicKey!,
        selectedToken.id.tokenAddress,
        parseFloat(solAmount),
        txBuilder,
        tokenData
      );

      txBuilder.add(instruction.instruction);
      txBuilder.feePayer = publicKey;

      try {
        const signature = await sendTransaction(txBuilder, connection);
        const confirmation = await connection.confirmTransaction(
          signature,
          "confirmed"
        );
        Loading.remove();
        console.log("confirmation", confirmation);

        setIsSpinning(true);

        // Store the selected token to use in onFinishSpin
        setSelectedAddress(selectedToken.id.tokenAddress);

        const txUrl = `https://explorer.solana.com/tx/${signature}`;
        addLog(
          `You received ${instruction.tokenAmount} ${tokenData["symbol"]} tokens for ${solAmount} SOL - ${txUrl}`
        );
      } catch (txError: any) {
        Loading.remove();
        if (txError.message.includes("User rejected")) {
          addLog("Transaction cancelled by user");
          return;
        }
        addLog(`Transaction failed: ${txError.message}`);
        throw txError;
      }
    } catch (error: any) {
      Loading.remove();
      console.error("Error:", error);
      addLog(`Error: ${error.message}`);
      alert(`Transaction failed: ${error.message}`);
    }
  };

  const addresses = [
    {
      tokenAddress: "DMtU33EtxfmbjoPXTWxtFRZX6dtrKhHLPLa6jGwSpump", //success
      tokenAssociatedAddress: "2Wc6BTtpQUMswqsDkUrq9ecRR3BRy2Wmpnv6JQG7zjUK",
    },
    {
      tokenAddress: "DMtU33EtxfmbjoPXTWxtFRZX6dtrKhHLPLa6jGwSpump", //success
      tokenAssociatedAddress: "2Wc6BTtpQUMswqsDkUrq9ecRR3BRy2Wmpnv6JQG7zjUK",
    },
    {
      tokenAddress: "DMtU33EtxfmbjoPXTWxtFRZX6dtrKhHLPLa6jGwSpump", //success
      tokenAssociatedAddress: "2Wc6BTtpQUMswqsDkUrq9ecRR3BRy2Wmpnv6JQG7zjUK",
    },
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
    id: address,
    value: shortenAddress(address.tokenAddress),
  }));

  return (
    <div
      className="flex flex-col items-center justify-items-center pb-20 gap-16 p-6 font-[family-name:var(--font-geist-sans)]"
      style={{
        background:
          "linear-gradient(343.88deg, #302756 30.66%, #1B1D28 97.06%)",
      }}
    >
      <Header />
      <main className="flex flex-col gap-8 row-start-2 items-center w-full">
        <div className="flex flex-col gap-8 items-center relative w-full">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-[23px] font-semibold text-white">
              Welcome to the
            </h1>
            <p
              className="text-[42px] font-normal"
              style={{
                background: "linear-gradient(0deg, #86EFAC, #86EFAC)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              WHEEL OF PUMP
            </p>
          </div>
          <div>
            <SpinWheel
              items={addresses.map((addr) => ({
                value: addr.value,
                tokenAddress: addr.id.tokenAddress,
              }))}
              onFinishSpin={() => {
                setIsSpinning(false);
              }}
              isSpinning={isSpinning}
              selectedAddress={selectedAddress} // Pass the selected address
            />
          </div>
          <div className="text-[17px] text-white">
            <span>Total Spins: {totalSpins}</span>
          </div>
          <input
            type="number"
            placeholder="Enter SOL Amount"
            value={solAmount}
            onChange={(e) => setSolAmount(e.target.value)}
            style={{
              background: "linear-gradient(180deg, #272949 0%, #3E3C52 100%)",
            }}
            className="border rounded px-6 py-2 text-white w-[450px]"
          />
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap gap-2 justify-center">
              {predefinedAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setSolAmount(amount.toString())}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm transition-colors"
                  style={{
                    background:
                      "linear-gradient(180deg, #86EFAC 0%, #2DB15C 100%)",
                  }}
                >
                  {amount} SOL
                </button>
              ))}
            </div>
          </div>
          <button
            className="bg-green-500 w-[200px] text-white px-4 py-2 rounded border-[1px] border-[#C6C2C2] text-[15px]"
            onClick={async () => buyCoin()}
            style={{
              background: "linear-gradient(180deg, #272949 0%, #3E3C52 100%)",
            }}
          >
            {connected ? "Buy a Coin" : "Connect Wallet"}
          </button>
          <Image
            src="/second-image-4.png"
            alt="second-image-4"
            width={246}
            height={334}
            className="absolute bottom-0 right-0"
          />
          <Image
            src="/second-image-2.png"
            alt="second-image-4"
            width={146}
            height={234}
            className="absolute top-0 right-0"
          />
          <Image
            src="/second-image-3.png"
            alt="second-image-3"
            width={196}
            height={284}
            className="absolute bottom-0 left-0"
          />
          <Image
            src="/second-image-1.png"
            alt="second-image-1"
            width={196}
            height={284}
            className="absolute top-6 left-20"
          />
        </div>
        <div className="w-full mt-8">
          <h3
            className="text-[20px] font-semibold mb-2"
            style={{
              background: "linear-gradient(0deg, #86EFAC, #86EFAC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Transaction Logs
          </h3>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-48 overflow-y-auto font-mono text-sm border-2 border-[#C6C2C2]">
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
