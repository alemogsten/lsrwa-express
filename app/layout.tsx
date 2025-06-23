import "./globals.css";
import { Inter } from 'next/font/google';
import { Web3Provider } from '@/web3providers';

export const metadata = {
  title: "My App",
  description: "Material Tailwind with Next.js",
};

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Web3Provider>{children}</Web3Provider>
      </body>
    </html>
  );
}
