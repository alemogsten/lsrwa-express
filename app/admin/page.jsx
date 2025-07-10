'use client';

import ProcessRequests from '../components/admin/ProcessRequests';
import Borrows from '../components/admin/Borrows';
import ProcessEpoch from '../components/admin/ProcessEpoch';
import EpochDurationManager from '../components/admin/EpochDurationManager';
import RewardAPRManager from '../components/admin/RewardAprManager';
import CollateralRatioSetting from '../components/admin/CollateralRatioSetting';
import LiquidityCard from '../components/admin/LiquidityCard';
import PendingWithdrawalCard from '../components/admin/PendingWithdrawalCard';
import LendingCard from '../components/admin/LendingCard';
import LiquidityTokenCard from '../components/admin/LiquidityTokenCard';
import WalletConnectButton from '../components/admin/WalletConnectButton';
import { useWallet } from '@/hooks/useWallet';

export default function AdminDashboard() {
const {
    isAdminConnected,
  } = useWallet();
    return (
        <div className="p-6 space-y-6">
            <div className='flex justify-end'>
                <WalletConnectButton />
            </div>
            {isAdminConnected && <>
            <div className='grid grid-cols-4 gap-2'>
                <LiquidityCard />
                <PendingWithdrawalCard />
                <LendingCard />
                <LiquidityTokenCard />
            </div>
            <ProcessRequests />
            <Borrows />
            <div className='grid grid-cols-2 gap-4'>
                <RewardAPRManager />
                <CollateralRatioSetting />
                <EpochDurationManager />
            </div>
            <div className='mt-10'>
                <ProcessEpoch />
            </div>
            </>}
        </div>
    );
}
