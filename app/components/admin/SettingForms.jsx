'use client';

import EpochDurationManager from './settings/EpochDurationManager';
import RewardAPRManager from './settings/RewardAprManager';
import MaxEpochSetting from './settings/MaxEpochSetting';
import CollateralRatioSetting from './settings/CollateralRatioSetting';

import { useSettings } from '@/hooks/useSettings';

export default function SettingForms() {
    const {
        rewardAPR, 
        epochDuration,
        maxEpoch,
        refetch,
        isLoading,
        error,
    } = useSettings();

    return (
        <div className='grid grid-cols-2 gap-4'>
            <RewardAPRManager rewardAPR={rewardAPR} refetch={refetch}/>
            <MaxEpochSetting maxEpochsBeforeLiquidation={maxEpoch} refetch={refetch}/>
            <CollateralRatioSetting />
            <EpochDurationManager epochDuration={epochDuration} refetch={refetch}/>
        </div>
    );
}
