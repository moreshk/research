import Image from 'next/image';
import Link from 'next/link';

const TopMenuBar = () => {
  return (
    <nav className="bg-background border-b border-gray-700 p-4">
      <div className="container mx-auto flex items-center justify-between">
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
        {/* <div className="space-x-4">
          <Link href="/" className="text-foreground hover:text-gray-300">Home</Link>
          <Link href="/about" className="text-foreground hover:text-gray-300">About</Link>
          <Link href="/contact" className="text-foreground hover:text-gray-300">Contact</Link>
        </div> */}
      </div>
    </nav>
  );
};

export default TopMenuBar; 