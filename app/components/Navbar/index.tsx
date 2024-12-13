"use client";

import { DasboardIcon, GameIcon } from "@/app/utils/icons";
import { usePathname, useRouter } from "next/navigation";

export const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex ml-10 gap-8 text-[#86EFAC] text-[18px] font-semibold">
      <div
        className={`flex items-center gap-2 cursor-pointer transition-colors ${
          pathname === "/" ? "text-[#86EFAC]" : "text-white"
        }`}
        onClick={() => router.push("/")}
      >
        <DasboardIcon active={pathname === "/"} />
        Dashboard
      </div>
      <div
        className={`flex items-center gap-2 cursor-pointer transition-colors ${
          pathname === "/game" ? "text-[#86EFAC]" : "text-white"
        }`}
        onClick={() => router.push("/game")}
      >
        <GameIcon active={pathname === "/game"} />
        Game
      </div>
    </div>
  );
};
