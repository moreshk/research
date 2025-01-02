/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';

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
};

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: 'all',
    chain: 'all',
    ecosystem: 'all'
  });

  useEffect(() => {
    async function fetchTokens() {
      try {
        const response = await fetch('/api/tokens');
        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }
        const data = await response.json();
        setTokens(data);
      } catch (err) {
        setError('Failed to load tokens');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchTokens();
  }, []);

  const uniqueChains = Array.from(new Set(tokens.map(token => token.chain)));
  const uniqueEcosystems = Array.from(new Set(tokens.map(token => token.ecosystem)))
    .filter(ecosystem => ecosystem)
    .sort();

  const filteredTokens = tokens.filter(token => {
    const typeMatch = filters.type === 'all' || 
      (filters.type === 'agent' && token.is_agent) ||
      (filters.type === 'framework' && token.is_framework) ||
      (filters.type === 'application' && token.is_application) ||
      (filters.type === 'meme' && token.is_meme);
    
    const chainMatch = filters.chain === 'all' || token.chain === filters.chain;
    const ecosystemMatch = filters.ecosystem === 'all' || token.ecosystem === filters.ecosystem;
    
    return typeMatch && chainMatch && ecosystemMatch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Tokens</h1>
      
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

        <select
          className="bg-gray-800 text-white rounded px-3 py-2"
          value={filters.chain}
          onChange={(e) => setFilters(prev => ({ ...prev, chain: e.target.value }))}
        >
          <option value="all">All Chains</option>
          {uniqueChains.map(chain => (
            <option key={chain} value={chain}>{chain}</option>
          ))}
        </select>

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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contract</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {filteredTokens.map((token: Token) => (
              <tr key={token.id} className="hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
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
                      <div className="text-sm text-gray-400">{token.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200">
                    {token.chain}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-200">
                    {token.ecosystem || 'Unknown'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-mono text-gray-300">
                    {`${token.contract_address.slice(0, 6)}...${token.contract_address.slice(-4)}`}
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
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
