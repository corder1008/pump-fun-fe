import { Navbar } from "../Navbar";
import { ConnectWallet } from "../WalletButton";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="flex justify-between w-full p-4">
      <div className="flex items-center gap-4">
        <Image src="/logo.png" alt="pump" width={77} height={99} />
        <Navbar />
      </div>
      <ConnectWallet />
    </header>
  );
};
