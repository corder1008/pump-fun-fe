"use client";
import { useEffect, useState } from "react";

import { useWallet } from "@solana/wallet-adapter-react";
import { Header } from "./components/Header";
import { SpinWheel } from "react-spin-wheel";
import "react-spin-wheel/dist/index.css";

const addresses = [
  "UX67BbVRdmixHYoxUH62grWQXMmMPsj2vj5qDNRpump",
  "7UBk39uC5u6z9NSZKbK7uEMnucjyzqM3Rn9hM2wzpump",
  "3RFRdgDmFsgRH4MzdGQnPR2iEFMWThS7jPFj51Y9pump",
  "iRWRYogiXBuCXE1ip7GiE8qbAHV11cLUW5QmQ2bpump",
  "cY51CLoJmioNCC1wGyzbQ7FJGFcFFiNe7o5Gs5UABzR",
  "FgrWXdVn9eJP2XiykLB5ReqgtKvAEAx2RnBas57Dpump",
];

export default function Home() {
  const [solAmount, setSolAmount] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");
  const { connected } = useWallet();

  useEffect(() => {
    console.log(selectedAddress);
  }, [selectedAddress]);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen pb-20 gap-16 p-6 font-[family-name:var(--font-geist-sans)]">
      <Header />
      <main className="flex flex-col gap-8 row-start-2 items-center ">
        <div className="wheel-container">
          <SpinWheel
            items={addresses}
            onFinishSpin={(item) => {
              setSelectedAddress(item as string);
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
        <button className="bg-green-500 text-white px-4 py-2 rounded">
          {connected ? "Buy a Coin" : "Connect Wallet"}
        </button>
      </main>
    </div>
  );
}
