'use client';

import Image from 'next/image';

export default function Footer() {

  return (
    <div className='bg-white w-full px-[20px] py-[40px] md:px-[46px] md:py-[80px] xl:px-[160px] xl:py-[120px] flex justify-between' >
      <div className="lg:w-[282px] w-full ">
        <p className='flex gap-2 leading-[22px]'>
          <Image
            src='/logo_big.png'
            width={64}
            height={64}
            alt='logo'
           />
          Lorem Ipsum is simply dummy text of the printing and typesetting industry. </p>
        <div className='flex justify-between mt-4'>
          <button className='p-[10px] border border-[#E4E4E7] rounded-full'>
            <Image
            src='/assets/Telegram.svg'
            width={20}
            height={20}
            alt='telegram'
           />
          </button>
          <button className='p-[10px] border border-[#E4E4E7] rounded-full'>
            <Image
            src='/assets/Youtube.svg'
            width={20}
            height={20}
            alt='youture'
           />
          </button>
          <button className='p-[10px] border border-[#E4E4E7] rounded-full'>
            <Image
            src='/assets/Twitter.svg'
            width={20}
            height={20}
            alt='twitter'
           />
          </button>
          <button className='p-[10px] border border-[#E4E4E7] rounded-full'>
            <Image
            src='/assets/coin_market_cap.svg'
            width={20}
            height={20}
            alt='coin_market_cap'
           />
          </button>
          <button className='p-[10px] border border-[#E4E4E7] rounded-full'>
            <Image
            src='/assets/Mail.svg'
            width={20}
            height={20}
            alt='mail'
           />
          </button>
        </div>
      </div>
      <div className='flex justify-around gap-6'>
        <div className='flex flex-col gap-8'>
          <a href="#">Company</a>
          <a href="#">Abount Us</a>
          <a href="#">FAQ</a>
          <a href="#">Blog</a>
        </div>
        <div className='flex flex-col gap-8'>
          <a href="#">Useful Links</a>
          <a href="#">BSC Scan</a>
          <a href="#">Github</a>
          <a href="#">Inherity</a>
        </div>
        <div className='flex flex-col gap-8'>
          <a href="#">Token Trackers</a>
          <a href="#">Coin Gecko</a>
          <a href="#">PooCoin</a>
          <a href="#">DaapRadar</a>
        </div>
        <div className='flex flex-col gap-8'>
          <a href="#">Exchanges</a>
          <a href="#">Apeswap</a>
          <a href="#">Pancake Swap</a>
          <a href="#">Gate.io</a>
        </div>
      </div>
      <div className="lg:w-[230px] w-full ">
        <p className='flex gap-2 font-bold text-base'>
            <Image
            src='/assets/email_green.svg'
            width={20}
            height={20}
            alt='email'
           />
           Our News Letter
        </p>
        <p className='leading-[22px] mt-3'>Get the latest info and enjoy the benefits</p>
        <button className='flex items-center gap-2 bg-[#F6F8F9] rounded-full font-bold mt-3 p-[6px] pl-[24px]'>Subscribe Now 
          <Image
            src='/assets/sub_send.svg'
            width={32}
            height={32}
            alt='send'
           />
        </button>
      </div>
    </div>
  );
}
