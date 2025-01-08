'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaTwitter } from 'react-icons/fa';
import { IoDocumentTextOutline } from 'react-icons/io5';
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
            className="mr-2"
          />
          <span className="text-foreground text-xl font-bold">CYBER INDEX</span>
        </Link>
        <div className="ml-auto flex items-center space-x-4">
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
            className="bg-primary text-white px-4 py-2 rounded-full border border-white/40 hover:bg-primary/80"
            aria-label="Buy CYBR"
          >
            <span className="flex items-center">
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