'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter } from 'react-icons/fa';
import { IoDocumentTextOutline, IoAdd } from 'react-icons/io5';
import { BiPurchaseTag } from 'react-icons/bi';
import dynamic from 'next/dynamic';

const WalletMultiButtonDynamic = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

const TopMenuBar = () => {
  return (
    <nav className="bg-background border-b border-gray-700 p-4">
      <div className="container mx-auto flex items-center">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="Logo"
            width={32}
            height={32}
            className="mr-2 hidden sm:block"
          />
          <span className="text-foreground text-xl font-bold hidden sm:block">CYBER INDEX</span>
        </Link>
        
        <Link
          href="/add-token"
          className="ml-0 sm:ml-6 bg-primary text-white w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full border border-white/40 hover:bg-primary/80 flex items-center justify-center"
        >
          <IoAdd size={16} className="sm:mr-2" />
          <span className="hidden sm:inline">Add Token</span>
        </Link>

        <div className="ml-auto flex items-center space-x-2 sm:space-x-4">
          <Link
            href="https://x.com/launchcybers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-gray-300"
            aria-label="Twitter"
          >
            <FaTwitter size={20} />
          </Link>
          <Link
            href="https://docs.cybers.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground hover:text-gray-300"
            aria-label="Documentation"
          >
            <IoDocumentTextOutline size={20} />
          </Link>
          <Link
            href="https://jup.ag/swap/SOL-CybRqhnLL2WtBdCD4afxYCLVKwkLaDw2iUsNb1kisfQz"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-white w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full border border-white/40 hover:bg-primary/80 flex items-center justify-center"
            aria-label="Buy CYBR"
          >
            <BiPurchaseTag size={16} className="sm:hidden" />
            <span className="hidden sm:flex items-center">
              <Image
                src="/logo.png"
                alt="CYBR"
                width={16}
                height={16}
                className="mr-2"
              />
              Buy CYBR
            </span>
          </Link>
          <WalletMultiButtonDynamic className="!bg-primary" />
        </div>
      </div>
    </nav>
  );
};

export default TopMenuBar; 