'use client';

import Image from 'next/image';

export default function VerifyFrom() {
  return (
    <div>
      <div className='rounded-[12px] p-[16px] bg-[#F6F8F9]'>
        <p className="flex text-[#D21111] font-bold">
          <Image src="/assets/warning.png"
            alt="contract"
            width={20}
            height={20}
            priority />
            KYC not verified
          </p>
          <p className=''>Please continue to verify your identity for the security of your account</p>
      </div>
      <button className="mt-6 h-[48px] flex w-full justify-center items-center gap-4 bg-green text-white rounded-[100px]">
        Verify Now 
        <Image
          src="/assets/right_icon.svg"
          alt="contract"
          width={14}
          height={14}
          priority
        />
      </button>
    </div>
  );
}
