'use client';

import ExecuteWithdrawForm from '../components/ExecuteWithdrawForm';
import RequestQueue from '../components/RequestQueue';

export default function Withdraw() {

   return (
    <main>
        <ExecuteWithdrawForm />
        <RequestQueue />
    </main>
   );
}