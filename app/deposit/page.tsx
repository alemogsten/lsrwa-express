'use client';

import clsx from "clsx";
import { useRouter } from 'next/navigation';
import DepositForm from '../components/depositor/DepositForm';

export default function Deposit() {

   return (
    <main>
        <DepositForm />
    </main>
   );
}