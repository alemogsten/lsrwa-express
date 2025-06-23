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
import Header from "../components/Header";
import Image from 'next/image';

import { useWallet } from '@/hooks/useWallet';
import clsx from "clsx";

export default function Swap() {
  const {
    address,
    isConnected,
    disconnect,
    balance,
    symbol,
    isBalanceLoading,
  } = useWallet();
  
  return (
    <main>
        <Header />
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
