"use client";
import { Header } from "./components/Header";
import Image from "next/image";

import "react-spin-wheel/dist/index.css";

export default function Home() {
  return (
    <div
      className="flex flex-col items-center justify-items-center gap-16 font-[family-name:var(--font-geist-sans)]"
      style={{
        background:
          "linear-gradient(343.88deg, #302756 30.66%, #1B1D28 97.06%)",
      }}
    >
      <Header />
      <main className="flex flex-col gap-8 row-start-2 items-center w-full relative pb-10">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-[23px] font-semibold text-white">
            Welcome to your
          </h1>
          <p
            className="text-[42px] font-normal"
            style={{
              background: "linear-gradient(0deg, #86EFAC, #86EFAC)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            DASHBOARD!
          </p>
        </div>
        <div className="flex flex-row gap-4">
          <button
            className=" text-white text-[16px] px-4 py-2 rounded "
            style={{
              background: "#2F4640",
              boxShadow: "0px -4px 4px 0px #00000040 inset",
            }}
          >
            Your Activity
          </button>
          <button
            className=" text-[#000000] text-[16px] font-normal px-4 py-2 rounded "
            style={{
              background: "#4ADE80",
              boxShadow: "0px -4px 4px 0px #00000040 inset",
            }}
          >
            Top 20 Globally
          </button>
        </div>
        <div
          className="w-[456px] h-[472px] border-[1px] border-[#C6C2C2] rounded-[10px]"
          style={{
            background: " linear-gradient(180deg, #272949 0%, #3E3C52 100%)",
          }}
        ></div>
        <Image
          src="/cat.png"
          alt="cat"
          width={296}
          height={364}
          className="absolute bottom-0 right-0"
        />

        <Image
          src="/image-2.png"
          alt="image2"
          width={161}
          height={64}
          className="absolute top-0 right-0"
        />

        <Image
          src="/image-1.png"
          alt="image1"
          width={101}
          height={34}
          className="absolute top-0 left-0"
        />

        <Image
          src="/image-3.png"
          alt="image3"
          width={201}
          height={134}
          className="absolute bottom-2 left-0"
        />
      </main>
    </div>
  );
}
