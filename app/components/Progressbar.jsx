'use client';

export default function Progressbar({progress, height=15}) {

  return (
    <div className='bg-[#DEF1E6] rounded-full w-full' style={{ height: `${height}px` }}>
        <div className='h-full rounded-full bg-green' style={{ width: `${progress}%` }}></div>
    </div>
  );
}
