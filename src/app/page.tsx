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
  is_agent: boolean;
  is_framework: boolean;
  is_application: boolean;
  is_meme: boolean;
};

export default function Home() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Tokens</h1>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Token</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Chain</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contract</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {tokens.map((token: Token) => (
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
