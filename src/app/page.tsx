import { getTokens } from '@/lib/db';

export default async function Home() {
  let tokens = [];
  
  try {
    tokens = await getTokens();
  } catch (error) {
    console.error('Error fetching tokens:', error);
  }

  return (
    <div className="min-h-screen p-8">
      <main className="max-w-6xl mx-auto">
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-lg overflow-hidden">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="px-4 py-2 text-left text-gray-200">Symbol</th>
                <th className="px-4 py-2 text-left text-gray-200">Name</th>
                <th className="px-4 py-2 text-left text-gray-200">Chain</th>
                <th className="px-4 py-2 text-left text-gray-200">Contract</th>
                <th className="px-4 py-2 text-left text-gray-200">Agent</th>
                <th className="px-4 py-2 text-left text-gray-200">Framework</th>
                <th className="px-4 py-2 text-left text-gray-200">Application</th>
                <th className="px-4 py-2 text-left text-gray-200">Meme</th>
              </tr>
            </thead>
            <tbody>
              {tokens.map((token) => (
                <tr key={`${token.contract_address}-${token.chain}`} className="border-t border-gray-700">
                  <td className="px-4 py-2 text-white">{token.symbol}</td>
                  <td className="px-4 py-2 text-white">{token.name}</td>
                  <td className="px-4 py-2 text-white">{token.chain}</td>
                  <td className="px-4 py-2 font-mono text-sm text-gray-300">
                    {token.contract_address.slice(0, 6)}...{token.contract_address.slice(-4)}
                  </td>
                  <td className="px-4 py-2">
                    {token.is_agent ? '✅' : '❌'}
                  </td>
                  <td className="px-4 py-2">
                    {token.is_framework ? '✅' : '❌'}
                  </td>
                  <td className="px-4 py-2">
                    {token.is_application ? '✅' : '❌'}
                  </td>
                  <td className="px-4 py-2">
                    {token.is_meme ? '✅' : '❌'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
