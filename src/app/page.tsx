/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { InfoCircledIcon, CheckIcon, CopyIcon, ChevronDownIcon, ChevronRightIcon, GitHubLogoIcon, TwitterLogoIcon, ExternalLinkIcon, ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

type Token = {
  id: number;
  name: string;
  symbol: string;
  description: string;
  contract_address: string;
  image_url: string;
  chain: string;
  ecosystem: string;
  is_agent: boolean;
  is_framework: boolean;
  is_application: boolean;
  is_meme: boolean;
  price: number;
  price_change_24h: number;
  price_updated_at: string;
  project_desc: string | null;
  github_url: string | null;
  github_analysis: string | null;
  twitter_url: string | null;
  dexscreener_url: string | null;
};

interface SortableHeaderProps {
  field: SortField;
  label: string;
  sortConfig: {
    field: SortField;
    direction: SortDirection;
  };
  onSort: (field: SortField) => void;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({ 
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

const TypeTooltip = () => (
  <Tooltip.Provider>
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button className="inline-flex items-center ml-1">
          <InfoCircledIcon className="h-4 w-4 text-gray-400" />
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          className="max-w-md rounded-md bg-gray-800 px-4 py-3 text-sm text-gray-100 shadow-lg"
          sideOffset={5}
        >
          <p className="mb-2">
            <strong>Agents:</strong> AI powered digital entities that have a degree of autonomy in the tasks they perform. 
            They can respond on various platforms such as twitter, discord and other social media platforms and take on 
            personas as defined by their creators. They can also perform other tasks such as trading etc. Eg: ELIZA.
          </p>
          <p className="mb-2">
            <strong>Agent Frameworks:</strong> Development toolkits that make development of these agents easier. 
            eg: Virtuals, Ai16z, Zerebro etc.
          </p>
          <p className="mb-2">
            <strong>Applications:</strong> Something which can be used to either receive information or perform some 
            action either by humans or agents. eg: cookie, dexscreener etc.
          </p>
          <p>
            <strong>Meme:</strong> A pure meme is a content only play which may or may not be powered by AI. 
            for eg: FARTCOIN.
          </p>
          <Tooltip.Arrow className="fill-gray-800" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  </Tooltip.Provider>
);

const CopyableAddress = ({ address }: { address: string }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Format address to show only first 6 and last 4 characters
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <button
      onClick={copyToClipboard}
      className="group flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 transition-colors"
      title="Click to copy address"
    >
      <span className="font-mono text-sm">{formatAddress(address)}</span>
      {copied ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <CopyIcon className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  );
};

const ChainSelect = ({ 
  value, 
  onChange, 
  chains 
}: { 
  value: string, 
  onChange: (value: string) => void, 
  chains: string[] 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        className="bg-gray-800 text-white rounded px-3 py-2 w-40 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value === 'all' ? (
          <span>All Chains</span>
        ) : (
          <div className="flex items-center gap-2">
            <img
              src={`/${value.toLowerCase()}.png`}
              alt={value}
              className="h-4 w-4"
            />
            <span>{value}</span>
          </div>
        )}
        <span className="ml-2">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-gray-800 border border-gray-700 rounded-md shadow-lg">
          <div 
            className="p-2 hover:bg-gray-700 cursor-pointer"
            onClick={() => {
              onChange('all');
              setIsOpen(false);
            }}
          >
            All Chains
          </div>
          {chains.map(chain => (
            <div
              key={chain}
              className="p-2 hover:bg-gray-700 cursor-pointer flex items-center gap-2"
              onClick={() => {
                onChange(chain);
                setIsOpen(false);
              }}
            >
              <img
                src={`/${chain.toLowerCase()}.png`}
                alt={chain}
                className="h-4 w-4"
              />
              <span>{chain}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Add this helper function for formatting prices
function formatPrice(price: number | null): string {
  if (price === null || price === undefined) return 'N/A';
  return price < 0.01 
    ? `$${price.toFixed(8)}` 
    : `$${price.toFixed(2)}`;
}

// Add this helper function for formatting price changes
function formatPriceChange(change: number | null): string {
  if (change === null || change === undefined) return 'N/A';
  return `${change > 0 ? '+' : ''}${change.toFixed(2)}%`;
}

type SortField = 'price' | 'price_change_24h' | null;
type SortDirection = 'asc' | 'desc';

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    chain: 'all',
    ecosystem: 'all'
  });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [sortConfig, setSortConfig] = useState<{
    field: SortField;
    direction: SortDirection;
  }>({
    field: null,
    direction: 'desc'
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // First, try to update prices (will use cache if available)
        const priceResponse = await fetch('/api/updatePrices');
        const priceData = await priceResponse.json();
        
        if (!priceData.success) {
          console.warn('Price update failed:', priceData.error);
        }
        
        // Then fetch the tokens (which will include the latest prices)
        const tokenResponse = await fetch('/api/tokens');
        if (!tokenResponse.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const data = await tokenResponse.json();
        setTokens(data);
      } catch (err) {
        setError('Failed to load tokens');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const uniqueChains = Array.from(new Set(tokens.map(token => token.chain)));
  const uniqueEcosystems = Array.from(new Set(tokens.map(token => token.ecosystem)))
    .filter(ecosystem => ecosystem)
    .sort();

  const handleSort = (field: SortField) => {
    setSortConfig(current => ({
      field,
      direction: 
        current.field === field && current.direction === 'desc' 
          ? 'asc' 
          : 'desc'
    }));
  };

  const sortedAndFilteredTokens = React.useMemo(() => {
    const filtered = tokens.filter(token => {
      const typeMatch = filters.type === 'all' || 
        (filters.type === 'agent' && token.is_agent) ||
        (filters.type === 'framework' && token.is_framework) ||
        (filters.type === 'application' && token.is_application) ||
        (filters.type === 'meme' && token.is_meme);
      
      const chainMatch = filters.chain === 'all' || token.chain === filters.chain;
      const ecosystemMatch = filters.ecosystem === 'all' || token.ecosystem === filters.ecosystem;
      
      return typeMatch && chainMatch && ecosystemMatch;
    });

    if (sortConfig.field) {
      return [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.field!];
        const bValue = b[sortConfig.field!];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [tokens, filters, sortConfig]);

  const toggleRow = (id: number) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-8">
      {/* <h1 className="text-2xl font-bold mb-4">Tokens</h1> */}
      
      <div className="flex gap-4 mb-4">
        <select
          className="bg-gray-800 text-white rounded px-3 py-2"
          value={filters.type}
          onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
        >
          <option value="all">All Types</option>
          <option value="agent">Agent</option>
          <option value="framework">Framework</option>
          <option value="application">Application</option>
          <option value="meme">Meme</option>
        </select>

        <ChainSelect
          value={filters.chain}
          onChange={(value) => setFilters(prev => ({ ...prev, chain: value }))}
          chains={uniqueChains}
        />

        <select
          className="bg-gray-800 text-white rounded px-3 py-2"
          value={filters.ecosystem}
          onChange={(e) => setFilters(prev => ({ ...prev, ecosystem: e.target.value }))}
        >
          <option value="all">All Ecosystems</option>
          {uniqueEcosystems.map(ecosystem => (
            <option key={ecosystem} value={ecosystem}>{ecosystem}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ecosystem</th>
              <SortableHeader
                field="price"
                label="Price"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                field="price_change_24h"
                label="24h Change"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Type
                <TypeTooltip />
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {sortedAndFilteredTokens.map((token: Token) => (
              <React.Fragment key={token.id}>
                <tr 
                  className="hover:bg-gray-800 cursor-pointer"
                  onClick={() => toggleRow(token.id)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-400">
                        {expandedRows.has(token.id) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </div>
                      {token.image_url && (
                        <div className="flex-shrink-0 h-10 w-10 mr-4">
                          <img
                            src={token.image_url}
                            alt={token.name}
                            className="h-10 w-10 rounded-full"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white">{token.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400">{token.symbol}</span>
                          <CopyableAddress address={token.contract_address} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <img 
                      src={`/${token.chain.toLowerCase()}.png`}
                      alt={token.chain}
                      className="h-6 w-6"
                      title={token.chain}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-200">
                      {token.ecosystem || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-white font-medium">
                      {formatPrice(token.price)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`font-medium ${
                      !token.price_change_24h ? 'text-gray-400' :
                      token.price_change_24h > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPriceChange(token.price_change_24h)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {token.is_agent && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-900 text-purple-200">
                          Agent
                        </span>
                      )}
                      {token.is_framework && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-200">
                          Framework
                        </span>
                      )}
                      {token.is_application && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-900 text-yellow-200">
                          App
                        </span>
                      )}
                      {token.is_meme && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-pink-900 text-pink-200">
                          Meme
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedRows.has(token.id) && (
                  <tr className="bg-gray-800">
                    <td colSpan={6} className="px-6 py-4">
                      <div className="space-y-4">
                        {/* Project Description */}
                        <div className="text-gray-300 whitespace-pre-wrap animate-expandRow">
                          {token.project_desc || 'No description available.'}
                        </div>
                        
                        {/* Links Section */}
                        <div className="flex gap-4 pt-2">
                          {token.github_url && (
                            <a
                              href={token.github_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                              title="GitHub Repository"
                            >
                              <GitHubLogoIcon className="h-5 w-5" />
                              <span className="text-sm">GitHub</span>
                            </a>
                          )}
                          
                          {token.twitter_url && (
                            <a
                              href={token.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                              title="Twitter Profile"
                            >
                              <TwitterLogoIcon className="h-5 w-5" />
                              <span className="text-sm">Twitter</span>
                            </a>
                          )}
                          
                          {token.dexscreener_url && (
                            <a
                              href={token.dexscreener_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                              title="DexScreener"
                            >
                              <ExternalLinkIcon className="h-5 w-5" />
                              <span className="text-sm">DexScreener</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
