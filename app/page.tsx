'use client';
import RequestHistory from "./components/depositor/RequestHistory";
import SummaryCard from "./components/SummaryCard";
import WalletInfoCard from "./components/depositor/WalletInfoCard";
import AccountCard from "./components/depositor/AccountCard";
import PerformanceCard from "./components/depositor/PerformanceCard";
import EpochInfoCard from "./components/EpochInfoCard";
import Image from 'next/image';

import { useWallet } from '@/hooks/useWallet';
import { useSettings } from '@/hooks/useSettings';
import clsx from "clsx";

export default function Home() {
  const {
    isConnected,
  } = useWallet();
const { rewardAPR, epochDuration, isLoading } = useSettings();
  return (
    <main className="px-[20px] md:px-[66px] xl:px-[120px] py-20">
      
      <div className="flex items-center gap-[10px] p-[8px] pr-[30px] bg-white rounded-[50px] w-max">
        <Image
          src="/logo.png"
          alt="Logo"
          width={32}
          height={32}
          priority
        />
        <p className="font-medium">Effortless, Real-World Yield</p>
      </div>
      <div className="mt-8">
        <p className="font-bold text-[54px]">LSRWA Express</p>
        <p className="text-gray">Simply deposit USDC and earn real-world, asset-backed yield—no need to manually handle $LSRWA tokens.</p>
        <p className="text-green">Learn more</p>
      </div>
      {!isConnected && 
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard title={"Current Balance"} text={"$12,450.75"} description={"Available For Investment"}></SummaryCard>
        <SummaryCard title={"Interest Accrued"} text={"$1,287.34"} description={"Total earnings to date"}></SummaryCard>
        <SummaryCard title={"Pending Requests"} text={"3"} description={"Available For Investment"}></SummaryCard>
      </div>}
      <div className={clsx('mt-8 gap-10', isConnected ? 'grid grid-cols-5' : '')}>
        {isConnected &&  
        <div className="col-span-5 xl:col-span-3">
          <WalletInfoCard />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
            <AccountCard />
            <PerformanceCard rewardAPR={rewardAPR}/>
          </div>
        </div>
        }
        <div className="col-span-5 xl:col-span-2 lg:h-[565px] overflow-hidden">
        <RequestHistory />
        </div>
      </div>
      {
        isConnected ? 
        <div className="mt-8">
          <EpochInfoCard epochDuration={epochDuration}/>
        </div> : <></>
      }
      
    </main>
  );
}
