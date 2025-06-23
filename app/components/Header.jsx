'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';


export default function Header() {
  const router = useRouter();
  const handleLogoClick = () => {
    router.push('/');
  };
  return (
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
  );
}
