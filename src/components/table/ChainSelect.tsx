import React from 'react';

interface ChainSelectProps {
  value: string;
  onChange: (value: string) => void;
  chains: string[];
}

export const ChainSelect: React.FC<ChainSelectProps> = ({ value, onChange, chains }) => {
  return (
    <select
      className="bg-gray-800 text-white rounded px-3 py-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="all">All Chains</option>
      {chains.map(chain => (
        <option key={chain} value={chain}>{chain}</option>
      ))}
    </select>
  );
}; 