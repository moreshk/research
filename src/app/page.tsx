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
import { calculateCyberIndex } from '@/utils/calculateCyberIndex';
import * as Tooltip from '@radix-ui/react-tooltip';

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
        // Fetch Cyber Index for tokens with GitHub URLs
        data.forEach((token: Token) => {
          if (token.github_url) {
            fetchCyberIndex(token);
          }
        });
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
        (filters.type === 'meme' && token.is_meme) ||
        (filters.type === 'kol' && token.is_kol) ||
        (filters.type === 'defi' && token.is_defi);
      
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

  const fetchCyberIndex = async (token: Token) => {
    if (!token.github_url) return;

    try {
      const url = new URL(token.github_url);
      const [owner, repo] = url.pathname.split('/').filter(Boolean);
      if (!owner || !repo) throw new Error('Invalid GitHub URL format');

      const response = await fetch(`/api/github-repo-info?repo=${encodeURIComponent(token.github_url)}`);
      if (!response.ok) throw new Error('Failed to fetch repository data');

      const data = await response.json();
      const cyberIndex = calculateCyberIndex(data.publicData, data.authenticatedData);

      setTokens(prevTokens => 
        prevTokens.map(t => 
          t.id === token.id ? { ...t, cyberIndex } : t
        )
      );
    } catch (error) {
      console.error('Error fetching Cyber Index:', error);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-4 flex flex-col sm:flex-row gap-4 overflow-x-auto">
        <select
          className="bg-gray-800 text-white rounded px-3 py-2 w-full sm:w-auto"
          value={filters.type}
          onChange={(e) => handleFilterChange(e.target.value as FilterType)}
        >
          <option value="all">All Types</option>
          <option value="agent">Agent</option>
          <option value="framework">Framework</option>
          <option value="application">Application</option>
          <option value="meme">Meme</option>
          <option value="kol">KOL</option>
          <option value="defi">DeFi</option>
        </select>

        <ChainSelect
          value={filters.chain}
          onChange={(value) => setFilters(prev => ({ ...prev, chain: value }))}
          chains={uniqueChains}
        />

        <select
          className="bg-gray-800 text-white rounded px-3 py-2 w-full sm:w-auto"
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chain</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ecosystem</th>
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  Type
                  <TypeTooltip showIcon={true} />
                </div>
              </th>
              <SortableHeader
                field="cyberIndex"
                label={
                  <div className="flex items-center">
                    Github Score
                    <Tooltip.Provider>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <InfoCircledIcon className="ml-1 h-4 w-4 text-gray-400 cursor-help" />
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            className="bg-gray-800 px-4 py-2 rounded-md text-sm text-white shadow-lg max-w-xs"
                            sideOffset={5}
                          >
                            <p>Score based on repository activity, community engagement, and project health</p>
                            <Tooltip.Arrow className="fill-gray-800" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </Tooltip.Provider>
                  </div>
                }
                sortConfig={sortConfig}
                onSort={handleSort}
              />
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {sortedAndFilteredTokens.map((token: Token) => (
              <React.Fragment key={token.id}>
                <tr 
                  className="hover:bg-gray-800 cursor-pointer"
                  onClick={() => toggleRow(token.id)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 text-gray-400">
                        {expandedRows.has(token.id) ? (
                          <ChevronDownIcon className="h-4 w-4" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4" />
                        )}
                      </div>
                      {token.image_url && (
                        <div className="flex-shrink-0 h-8 w-8 mr-3">
                          <img
                            src={token.image_url}
                            alt={token.name}
                            className="h-8 w-8 rounded-full"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-white text-sm">{token.name}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{token.symbol}</span>
                          <CopyableAddress address={token.contract_address} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <img 
                      src={`/${token.id === 3 ? 'base' : token.chain.toLowerCase()}.png`}
                      alt={token.id === 3 ? 'base' : token.chain}
                      className="h-6 w-6"
                      title={token.id === 3 ? 'base' : token.chain}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-200">
                      {token.ecosystem || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-white font-medium text-sm">
                      {formatPrice(token.price)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`font-medium text-sm ${
                      !token.price_change_24h ? 'text-gray-400' :
                      token.price_change_24h > 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {formatPriceChange(token.price_change_24h)}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-white font-medium text-sm">
                      {token.market_cap ? formatPrice(token.market_cap, true) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${
                        token.breakout_score > 0 ? 'text-green-400' : 
                        token.breakout_score < 0 ? 'text-red-400' : 
                        'text-gray-400'
                      }`}>
                        {token.breakout_score !== null ? Math.round(token.breakout_score) : 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
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
                      {token.is_kol && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200">
                          KOL
                        </span>
                      )}
                      {token.is_defi && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-900 text-orange-200">
                          DeFi
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {token.github_url ? (
                        token.cyberIndex !== undefined && token.cyberIndex !== null ? 
                          token.cyberIndex 
                          : 'Loading...'
                      ) : 'N/A'}
                    </div>
                  </td>
                </tr>
                {expandedRows.has(token.id) && (
                  <tr className="bg-gray-800">
                    <td colSpan={9} className="px-4 py-4">
                      <div className="w-full sm:w-auto overflow-x-hidden">
                        <div className="space-y-6 max-w-[calc(100vw-2rem)] sm:max-w-none">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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

                          <div className="text-gray-300 animate-expandRow text-sm">
                            {token.project_desc || 'No description available.'}
                          </div>
                          
                          <div className="flex flex-wrap gap-3">
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
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 px-3 py-2 rounded-lg"
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
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 px-3 py-2 rounded-lg"
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
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-gray-700/50 px-3 py-2 rounded-lg"
                                title="DexScreener"
                              >
                                <ExternalLinkIcon className="h-5 w-5" />
                                <span className="text-sm">DexScreener</span>
                              </a>
                            )}
                          </div>
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
