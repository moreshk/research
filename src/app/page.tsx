/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useEffect, useState } from 'react';
import { InfoCircledIcon, GitHubLogoIcon, TwitterLogoIcon, ExternalLinkIcon, ChevronDownIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { TypeTooltip } from '@/components/table/TypeTooltip';
import { MomentumTooltip } from '@/components/table/MomentumTooltip';
import { ScoreTooltip } from '@/components/table/ScoreTooltip';
import { CopyableAddress } from '@/components/table/CopyableAddress';
import { ChainSelect } from '@/components/table/ChainSelect';
import { SortableHeader } from '@/components/table/SortableHeader';
import { Token, SortField, SortDirection, FilterType } from '@/types/token';
import { formatPrice, formatPriceChange } from '@/utils/format';
import Link from 'next/link';

interface Filters {
  type: FilterType;
  chain: string;
  ecosystem: string;
}

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
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
        const priceResponse = await fetch('/api/updatePrices');
        const priceData = await priceResponse.json();
        
        const tokenResponse = await fetch('/api/tokens');
        if (!tokenResponse.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const data = await tokenResponse.json();

        if (priceData && priceData.success && Array.isArray(priceData.data)) {
          setTokens(
            data.map((d: Token) => {
              const details = priceData.data.find(
                (a: any) => a.contract_address === d.contract_address
              );
              if (details) return { ...d, ...details };
              return d;
            })
          );
        } else {
          setTokens(data);
        }
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
        const aValue = sortConfig.field ? a[sortConfig.field] : null;
        const bValue = sortConfig.field ? b[sortConfig.field] : null;
        
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

  const handleFilterChange = (type: FilterType) => {
    setFilters(prev => ({ ...prev, type }));
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-8">
      {/* <h1 className="text-2xl font-bold mb-4">Tokens</h1> */}
      
      <div className="flex gap-4 mb-4">
        <select
          className="bg-gray-800 text-white rounded px-3 py-2"
          value={filters.type}
          onChange={(e) => handleFilterChange(e.target.value as FilterType)}
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
              <SortableHeader
                field="market_cap"
                label="Market Cap"
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <SortableHeader
                field="breakout_score"
                label={
                  <div className="flex items-center">
                    Momentum
                    <MomentumTooltip score={null} showScore={false} />
                  </div>
                }
                sortConfig={sortConfig}
                onSort={handleSort}
              />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Type
                  <TypeTooltip showIcon={true} />
                </div>
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
                      src={`/${token.id === 3 ? 'base' : token.chain.toLowerCase()}.png`}
                      alt={token.id === 3 ? 'base' : token.chain}
                      className="h-6 w-6"
                      title={token.id === 3 ? 'base' : token.chain}
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
                    <span className="text-white font-medium">
                      {token.market_cap ? formatPrice(token.market_cap, true) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {token.breakout_score ?? 'N/A'}
                    </div>
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
                    <td colSpan={7} className="px-6 py-4">
                      <div className="space-y-4">
                        {/* Breakout Score Components */}
                        <div className="grid grid-cols-5 gap-4 pb-4 border-b border-gray-700">
                          <ScoreTooltip
                            label="Price Score"
                            score={token.price_score}
                            tooltipContent="Weighted price change for the last 24h"
                          />
                          <ScoreTooltip
                            label="Volume Score"
                            score={token.volume_score}
                            tooltipContent="Weighted volume change for the last 24h"
                          />
                          <ScoreTooltip
                            label="Buy/Sell Score"
                            score={token.buy_sell_score}
                            tooltipContent="Weighted difference between buyers and sellers for the last 24h"
                          />
                          <ScoreTooltip
                            label="Holder Score"
                            score={token.wallet_score}
                            tooltipContent="Weighted unique wallet count for the last 24h"
                          />
                          <ScoreTooltip
                            label="Trade Score"
                            score={token.trade_score}
                            tooltipContent="Weighted trade counts for the last 24h"
                          />
                        </div>

                        {/* Existing expanded content */}
                        <div className="text-gray-300 whitespace-pre-wrap animate-expandRow">
                          {token.project_desc || 'No description available.'}
                        </div>
                        
                        {/* Links Section */}
                        <div className="flex gap-4 pt-2">
                          {token.github_url && (
                            <Link
                              href={(() => {
                                try {
                                  const url = new URL(token.github_url);
                                  const [owner, repo] = url.pathname.split('/').filter(Boolean);
                                  if (!owner || !repo) throw new Error('Invalid GitHub URL format');
                                  return `/repo/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
                                } catch (e) {
                                  console.error('Invalid GitHub URL:', token.github_url);
                                  return '#';
                                }
                              })()}
                              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                              title="View Repository Details"
                            >
                              <GitHubLogoIcon className="h-5 w-5" />
                              <span className="text-sm">GitHub</span>
                            </Link>
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
