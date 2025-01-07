import { ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import React from 'react';

export type SortField = 
  | 'price' 
  | 'price_change_24h' 
  | 'market_cap' 
  | 'breakout_score' 
  | 'cyberIndex' 
  | null;
export type SortDirection = 'asc' | 'desc';

interface SortableHeaderProps {
  field: SortField;
  label: string | React.ReactNode;
  sortConfig: {
    field: SortField;
    direction: SortDirection;
  };
  onSort: (field: SortField) => void;
}

export const SortableHeader: React.FC<SortableHeaderProps> = ({ 
  field, 
  label, 
  sortConfig, 
  onSort 
}) => {
  return (
    <th 
      className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="inline-flex flex-col justify-center h-4">
          {sortConfig.field === field ? (
            sortConfig.direction === 'asc' ? (
              <ArrowUpIcon className="h-3 w-3" />
            ) : (
              <ArrowDownIcon className="h-3 w-3" />
            )
          ) : (
            <div className="opacity-0 group-hover:opacity-50">
              <ArrowUpIcon className="h-3 w-3" />
            </div>
          )}
        </span>
      </div>
    </th>
  );
}; 