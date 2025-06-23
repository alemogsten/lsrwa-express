'use client';


export default function SummaryCard({ title, text, description }) {
  return (
    <div className="bg-white rounded-[16px] shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px]">
      {title && <p className="text-base font-medium leading-[22px] text-black">{title}</p>}
      {text && <p className="mt-2 text-[24px] leading-[30px] font-bold text-green">{text}</p>}
      {description && <p className="mt-2 text-base font-medium leading-[22px] text-gray">{description}</p>}
    </div>
  );
}
