'use client';

import Header from "../components/Header";
import Image from 'next/image';


export default function Account() {
  
  return (
    <main>
        <Header />
        <div className="mt-[120px] py-[100px] px-[20px] md:px-[66px] xl:px-[120px] lg:flex justify-between bg-white">
            <div className="w-full lg:w-[357px] mt-20">
                <p className="text-base font-bold">You Won</p>
                <p className="text-[14px] leading-[16px] text-gray-400 mt-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-18 mt-20">
                <div className="flex items-center gap-4">
                    <Image src='/logo_big.png' width={48} height={48} alt="logo" />
                    <div>
                        <p className="font-bold text-base">0</p>
                        <p className="text-base mt-1">Land</p>
                    </div>
                    <Image src='/assets/plus_circle_sm.svg' width={14} height={14} alt="logo" />
                </div>
                <div className="flex items-center gap-4">
                    <Image src='/assets/lumber.png' width={48} height={48} alt="logo" />
                    <div>
                        <p className="font-bold text-base">0</p>
                        <p className="text-base mt-1">Lumber</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Image src='/assets/concrete.png' width={48} height={48} alt="logo" />
                    <div>
                        <p className="font-bold text-base">0</p>
                        <p className="text-base mt-1">Concrete</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Image src='/assets/steel.png' width={48} height={48} alt="logo" />
                    <div>
                        <p className="font-bold text-base">0</p>
                        <p className="text-base mt-1">Steel</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Image src='/assets/power.png' width={48} height={48} alt="logo" />
                    <div>
                        <p className="font-bold text-base">0</p>
                        <p className="text-base mt-1">Power</p>
                    </div>
                    <Image src='/assets/plus_circle_sm.svg' width={14} height={14} alt="logo" />
                </div>
                <div className="flex items-center gap-4">
                    <Image src='/assets/brick.png' width={48} height={48} alt="logo" />
                    <div>
                        <p className="font-bold text-base">0</p>
                        <p className="text-base mt-1">Brick</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Image src='/assets/credit.png' width={48} height={48} alt="logo" />
                    <div>
                        <p className="font-bold text-base">0</p>
                        <p className="text-base mt-1">Credits</p>
                    </div>
                </div>
            </div>
        </div>
    </main>
  );
}
