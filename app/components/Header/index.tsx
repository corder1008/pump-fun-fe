import { ConnectWallet } from "../WalletButton";

export const Header = () => {
  return (
    <header className="flex justify-between w-full">
      <div className="flex items-center">
        <h1 className="text-xl font-bold">PUMP.FUN</h1>
      </div>
      <ConnectWallet />
    </header>
  );
};
