import { testConnection } from '@/lib/db';

export default async function Home() {
  const isConnected = await testConnection();
  
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Database Connection Test</h1>
      <div className={`p-4 rounded-md ${isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        Database connection status: {isConnected ? 'Connected' : 'Failed to connect'}
      </div>
    </main>
  );
}
