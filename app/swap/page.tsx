'use client';

import Breadcrumbs from "../components/Breadcrumbs";
import SymbolChartCard from "../components/SymbolChartCard";
import TokenTradeCard from "../components/TokenTradeCard";
import TradeInfoCard from "../components/TradeInfoCard";
import FinancialSummaryCard from "../components/FinancialSummaryCard";
import BeneficalAssets from "../components/BeneficalAssets";
import CalcCard from "../components/CalcCard";
import InvestmentStepsCard from "../components/InvestmentStepsCard";
import Footer from "../components/Footer";
import Image from 'next/image';

import { useWallet } from '@/hooks/useWallet';
import clsx from "clsx";
import { useRouter } from 'next/navigation';

export default function Home() {
  const {
    address,
    isConnected,
    disconnect,
    balance,
    symbol,
    isBalanceLoading,
  } = useWallet();
  const router = useRouter();
  const handleLogoClick = () => {
    router.push('/');
  };
  return (
    <main>
        <div className="pt-20 px-[20px] md:px-[46px] lg:px-[80px]">
            <div className="flex justify-between items-center p-[16px] pl-[40px] bg-white rounded-full w-full">
                <Image
                src="/logo_big.png"
                alt="Logo"
                width={48}
                height={48}
                onClick={handleLogoClick}
                className="cursor-pointer"
                priority
                />
                <div className="flex gap-10 items-center">
                    <p className="cursor-pointer font-bold hidden xl:block">Flips</p>
                    <p className="cursor-pointer font-bold hidden xl:block">Properties</p>
                    <p className="cursor-pointer font-bold hidden xl:block">FAQ</p>
                    <button className="text-white rounded-full h-[48px] w-[132px] bg-green">White Paper</button>
                </div>
            </div>
        </div>
        <div className="mt-6 px-[20px] md:px-[66px] xl:px-[120px]">
            <div className="">
                <Breadcrumbs 
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Real World Assets'},
                    ]}/>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="col-span-3 lg:col-span-2 order-2 lg:order-1">
                    <SymbolChartCard />
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <TradeInfoCard title={'Cash On Cash Reture'} value={'7.67%'}/>
                        <TradeInfoCard title={'Avg. Net Rente'} value={'$ 10,499'}/>
                        <TradeInfoCard title={'Gross Rent per Year'} value={'$13,200'}/>
                    </div>
                    <div className="mt-6">
                        <FinancialSummaryCard />
                    </div>
                </div>
                <div className="col-span-3 lg:col-span-1 order-1 lg:order-2">
                    <TokenTradeCard />
                </div>
            </div>
        </div>
        <div className="mt-12">
            <BeneficalAssets />
        </div>
        <div className="px-[20px] pt-[50px] md:p-[86px] xl:p-[120px] justify-items-center lg:justify-items-start">
            <div className="flex items-center gap-[10px] p-[6px] pr-[20px] bg-white rounded-[50px] w-max">
                <Image
                src="/logo.png"
                alt="Logo"
                width={32}
                height={32}
                priority
                />
                <p className="font-medium">Estimate your potential earnings</p>
            </div>
            <div className="mt-8 w-full">
            <CalcCard />
            </div>
        </div>
        <InvestmentStepsCard />
        <Footer />
    </main>
  );
}
