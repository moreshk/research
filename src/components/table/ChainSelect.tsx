import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import Image from 'next/image';

interface ChainSelectProps {
  value: string;
  onChange: (value: string) => void;
  chains: string[];
}

export const ChainSelect: React.FC<ChainSelectProps> = ({ value, onChange, chains }) => {
  return (
    <Select.Root value={value} onValueChange={onChange}>
      <Select.Trigger 
        className="bg-gray-800 text-white rounded px-3 py-2 w-full sm:w-auto inline-flex items-center gap-2"
      >
        {value !== 'all' && (
          <img
            src={`/${value.toLowerCase()}.png`}
            alt={value}
            className="h-4 w-4"
          />
        )}
        <Select.Value placeholder="All Chains" />
        <Select.Icon>
          <ChevronDownIcon />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content 
          className="bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden z-50"
        >
          <Select.Viewport>
            <Select.Item 
              value="all"
              className="px-3 py-2 text-white hover:bg-gray-700 cursor-pointer flex items-center"
            >
              <Select.ItemText>All Chains</Select.ItemText>
            </Select.Item>

            {chains.map(chain => (
              <Select.Item
                key={chain}
                value={chain}
                className="px-3 py-2 text-white hover:bg-gray-700 cursor-pointer flex items-center gap-2"
              >
                <img
                  src={`/${chain.toLowerCase()}.png`}
                  alt={chain}
                  className="h-4 w-4"
                />
                <Select.ItemText>{chain}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}; 