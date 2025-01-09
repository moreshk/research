import React, { useState } from 'react';
import { CheckIcon, CopyIcon } from '@radix-ui/react-icons';

interface CopyableAddressProps {
  address: string;
  truncate?: boolean;
}

export const CopyableAddress: React.FC<CopyableAddressProps> = ({ 
  address, 
  truncate = true 
}) => {
  const [copied, setCopied] = useState(false);

  const truncateAddress = (addr: string) => {
    if (!truncate) return addr;
    return window.innerWidth < 640 ? `${addr.slice(0, 4)}...${addr.slice(-4)}` : `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span className="font-mono text-xs sm:text-sm">{truncateAddress(address)}</span>
      <button
        onClick={handleCopy}
        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
      >
        {copied ? (
          <CheckIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-400" />
        ) : (
          <CopyIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
        )}
      </button>
    </div>
  );
}; 