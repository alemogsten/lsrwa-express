'use client';

import ProcessRequests from '../components/admin/ProcessRequests';
import Borrows from '../components/admin/Borrows';
import ProcessEpoch from '../components/admin/ProcessEpoch';
import EpochDurationManager from '../components/admin/EpochDurationManager';
import RewardAPRManager from '../components/admin/RewardAprManager';
import MaxEpochSetting from '../components/admin/MaxEpochSetting';
import CollateralRatioSetting from '../components/admin/CollateralRatioSetting';
import LiquidityCard from '../components/admin/LiquidityCard';
import PendingWithdrawalCard from '../components/admin/PendingWithdrawalCard';
import LendingCard from '../components/admin/LendingCard';
import LiquidityTokenCard from '../components/admin/LiquidityTokenCard';
import TopupUSDC from '../components/admin/TopupUSDC';

export default function AdminDashboard() {

    return (
        <div className="p-6 space-y-6">
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
                <MaxEpochSetting />
                <CollateralRatioSetting />
                <EpochDurationManager />
            </div>
            <div className='mt-10'>
                <ProcessEpoch />
            </div>
            
        </div>
    );
}
