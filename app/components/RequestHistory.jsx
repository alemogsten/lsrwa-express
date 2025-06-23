'use client';
import clsx from "clsx";
import HistoryCard from "./HistoryCard";
import WalletConnectButton from "./WalletConnectButton";


export default function RequestHistory({ isConnected, histories }) {
  return (
    <div className={clsx('bg-white shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px] text-center h-full', isConnected ? 'rounded-[16px]' : 'rounded-[70px]')}>
      {
        histories.map(history => (
          <HistoryCard key={history.id} type={history.type} timestamp={history.timestamp} id={history.id} amount={history.amount} status={history.status} />  
        ))
      }
      <div className="mt-8 justify-items-center">
      <WalletConnectButton />
      </div>
    </div>
  );
}
