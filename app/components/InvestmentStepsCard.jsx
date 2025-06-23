'use client';

import Image from "next/image";
import Step1 from './Step1';
import Step2 from './Step2';
import Step3 from './Step3';

export default function InvestmentStepsCard() {

  return (
    <div className='bg-white w-full px-[20px] py-[40px] md:px-[46px] md:py-[80px] xl:px-[160px] xl:py-[120px]'>
      <div className="justify-items-center">
        <div className="flex items-center gap-[10px] p-[6px] pr-[20px] bg-[#F6F8F9] rounded-[50px] w-max">
          <Image
            src="/assets/unlock.svg"
            alt="Logo"
            width={32}
            height={32}
            priority
          />
          <p className="font-medium">Unlock your opportunity</p>
        </div>
      </div>
      <div className="mt-8 lg:justify-items-center">
        <p className="font-bold lg:text-[50px] md:text-[32px] text-[24px] leading-[60px]">Effortless Investment in 3 Steps</p>
        <p className="text-gray lg:w-[719px]">Unlock the world of property investment with ease through Landshare and RWA tokens. Our simple, 3-step process lets you invest in real estate without the complexities of traditional methods.</p>
      </div>
      <div className="mt-8 flex flex-col lg:flex-row gap-4 md:justify-between md:px-8 items-center">
        <Step1 />
        <Image
            src="/assets/arrow_right.svg"
            alt="Logo"
            width={70}
            height={2}
            priority
            className="hidden xl:block"
          />
        <Image
            src="/assets/arrow_down.svg"
            alt="Logo"
            width={2}
            height={70}
            priority
            className="block lg:hidden"
          />
          <Step2 />
        <Image
            src="/assets/arrow_right.svg"
            alt="Logo"
            width={70}
            height={2}
            priority
            className="hidden xl:block"
          />
        <Image
            src="/assets/arrow_down.svg"
            alt="Logo"
            width={2}
            height={70}
            priority
            className="block lg:hidden"
          />
          <Step3 />
      </div>
    </div>
  );
}
