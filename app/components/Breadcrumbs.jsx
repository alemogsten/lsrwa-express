'use client';

import Link from 'next/link';

export default function Breadcrumbs({ items }) {
  return (
    <nav className="text-green" aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, index) => (
          <>
          {index !== 0 && <li key={index+10000}>/</li>}
          <li key={index} className="flex items-center">
            {item.href ? (
              <Link href={item.href} className="hover:underline text-green">
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-500 font-medium">{item.label}</span>
            )}
          </li>
          
          </>
        ))}
      </ol>
    </nav>
  );
}
