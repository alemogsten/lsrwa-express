'use client';


export default function FinancialSummaryCard() {
  return (
    <div className="bg-white rounded-[16px] shadow-[1px_3px_4px_1px_rgba(0,0,0,0.12)] p-[24px]">
      <p className="font-bold text-[24px] leading-[30px]">Financial Summary</p>
      <div className="mt-6 flex justify-between">
        <p className="font-bold">Gross Rent per Year</p>
        <p className="">$13,200</p>
      </div>
      <div className="mt-6 flex justify-between">
        <p className="font-bold">Gross Rent per Month</p>
        <p className="">$1,100</p>
      </div>
      <div className="mt-6 flex justify-between">
        <p className="font-bold">Monthly Expences</p>
        <p className="">-$225.08</p>
      </div>
      <div className="mt-6 rounded-[12px] p-[16px] bg-[#F6F8F9]">
        <div className="flex justify-between">
          <p className="font-medium">Property Taxes</p>
          <p className="">-$ 29.91</p>
        </div>
        <div className="mt-6 flex justify-between">
          <p className="font-medium">Insurance</p>
          <p className="">-$ 107.16</p>
        </div>
        <div className="mt-6 flex justify-between">
          <p className="font-medium">Property Management</p>
          <p className="">-$ 88.00</p>
        </div>
      </div>
      <div className="mt-6 flex justify-between">
        <p className="font-bold">Payout Period</p>
        <p className="">5th Day Monthly</p>
      </div>
      <div className="mt-6 flex justify-between">
        <p className="font-bold">Rental Yieal/Token</p>
        <p className="">$ 3,84/year</p>
      </div>
      <div className="mt-6 flex justify-between">
        <p className="font-bold">Token Price</p>
        <p className="">$ 50.00</p>
      </div>
      <div className="mt-6 flex justify-between">
        <p className="font-bold">Total Tokens</p>
        <p className="">2,736</p>
      </div>
    </div>
  );
}
