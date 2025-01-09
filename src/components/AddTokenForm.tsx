"use client";

import React, { useState } from 'react';
import { VALID_CHAINS } from '@/lib/constants';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount 
} from '@solana/spl-token';
import { 
  ComputeBudgetProgram,
  Transaction, 
  PublicKey,
  Connection 
} from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

const PRESET_ECOSYSTEMS = [
  'Solana Agent Kit',
  'BabyAGI',
  'Truth Terminal',
  'ai16z',
  'FXN',
  'swarms',
  'Virtuals',
  'Phala',
  'ARC',
  'Zerepy',
  'VVAIFU',
  'Holoworld',
  'Dolion',
  'Top Hat'
];

const TOKEN_2022_PROGRAM_ID = new PublicKey('TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb');
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${process.env.NEXT_PUBLIC_HELIUS_API_KEY}`;

const AddTokenForm: React.FC = () => {
  const { publicKey, signTransaction } = useWallet();
  const [formData, setFormData] = useState({
    contract_address: '',
    chain: '',
    is_agent: false,
    is_framework: false,
    is_application: false,
    is_meme: false,
    is_kol: false,
    is_defi: false,
    project_desc: '',
    github_url: '',
    twitter_url: '',
    dexscreener_url: '',
    image_url: '',
    framework: '',
  });
  const [isCustomFramework, setIsCustomFramework] = useState(false);
  const [customFramework, setCustomFramework] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setError(null);

    if (name === 'framework') {
      if (e.target.id === 'framework-custom') {
        setCustomFramework(value);
        setFormData(prev => ({
          ...prev,
          framework: value
        }));
      } else {
        if (value === 'custom') {
          setIsCustomFramework(true);
          setFormData(prev => ({
            ...prev,
            framework: ''
          }));
        } else {
          setIsCustomFramework(false);
          setFormData(prev => ({
            ...prev,
            framework: value
          }));
          setCustomFramework('');
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!publicKey || !signTransaction) {
      setError('Please connect your wallet using the button in the top menu bar');
      return;
    }

    try {
      const connection = new Connection(HELIUS_RPC_URL, 'confirmed');
      const fromPubkey = publicKey;
      const toPubkey = new PublicKey(process.env.NEXT_PUBLIC_FEE_RECIPIENT_ADDRESS!);
      const tokenMintPubkey = new PublicKey(process.env.NEXT_PUBLIC_FEE_TOKEN_MINT_ADDRESS!);

      const fromTokenAccount = await getAssociatedTokenAddress(
        tokenMintPubkey,
        fromPubkey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      try {
        const tokenAccount = await getAccount(
          connection,
          fromTokenAccount,
          'confirmed',
          TOKEN_2022_PROGRAM_ID
        );

        const balance = Number(tokenAccount.amount);
        const requiredAmount = 1000 * 10**9; // 1000 tokens

        if (balance < requiredAmount) {
          setError(`Insufficient CYBER balance. You need 1000 CYBER tokens to add a new token. Your current balance: ${balance / 10**9} CYBER`);
          return;
        }
      } catch (error: any) {
        if (error.name === 'TokenAccountNotFoundError') {
          setError('You don\'t have any CYBER tokens in your wallet. Please acquire CYBER tokens before adding a new token.');
          return;
        }
        throw error;
      }

      const transaction = new Transaction();

      transaction.add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 400000 }),
        ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 1 })
      );

      const toTokenAccount = await getAssociatedTokenAddress(
        tokenMintPubkey,
        toPubkey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const toTokenAccountInfo = await connection.getAccountInfo(toTokenAccount);
      
      if (!toTokenAccountInfo) {
        transaction.add(
          createAssociatedTokenAccountInstruction(
            fromPubkey,
            toTokenAccount,
            toPubkey,
            tokenMintPubkey,
            TOKEN_2022_PROGRAM_ID,
            ASSOCIATED_TOKEN_PROGRAM_ID
          )
        );
      }

      const feeAmount = 1000 * 10**9; // 1000 tokens, adjust as needed

      transaction.add(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          fromPubkey,
          feeAmount,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );

      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      setIsLoading(true);
      setStatusMessage('Processing transaction...');

      const signedTransaction = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(signedTransaction.serialize());
      await connection.confirmTransaction(signature, 'confirmed');

      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          transactionSignature: signature,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add token');
      }

      setSuccess(true);
      setStatusMessage('Token successfully added, details populated in ~1h!');
      setFormData({
        contract_address: '',
        chain: '',
        is_agent: false,
        is_framework: false,
        is_application: false,
        is_meme: false,
        is_kol: false,
        is_defi: false,
        project_desc: '',
        github_url: '',
        twitter_url: '',
        dexscreener_url: '',
        image_url: '',
        framework: '',
      });

      setTimeout(() => {
        setSuccess(false);
        setStatusMessage('');
      }, 5000);
    } catch (error: any) {
      console.error('Transaction error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
      setStatusMessage('');
    }
  };

  const inputClasses = "mt-2 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 py-2.5 px-3 text-base cursor-text transition-colors duration-200";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
  const sectionClasses = "space-y-6 bg-gray-900/50 p-6 rounded-lg";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Required Fields Section */}
      <div className={sectionClasses}>
        <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Required Information</h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label htmlFor="contract_address" className={labelClasses}>
              Contract Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="contract_address"
              name="contract_address"
              value={formData.contract_address}
              onChange={handleChange}
              required
              placeholder="Enter contract address"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="chain" className={labelClasses}>
              Chain <span className="text-red-500">*</span>
            </label>
            <select
              id="chain"
              name="chain"
              value={formData.chain}
              onChange={handleChange}
              required
              className={`${inputClasses} cursor-pointer`}
            >
              <option value="">Select a chain</option>
              {VALID_CHAINS.map((chain) => (
                <option key={chain} value={chain}>{chain}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Token Type Section */}
      <div className={sectionClasses}>
        <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Token Type</h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {[
            { id: 'is_agent', label: 'Agent' },
            { id: 'is_framework', label: 'Framework' },
            { id: 'is_application', label: 'Application' },
            { id: 'is_meme', label: 'Meme' },
            { id: 'is_kol', label: 'KOL' },
            { id: 'is_defi', label: 'DeFi' },
          ].map(({ id, label }) => (
            <div key={id} className="flex items-center space-x-3 p-3 rounded-md hover:bg-gray-800/50">
              <input
                type="checkbox"
                id={id}
                name={id}
                checked={formData[id as keyof typeof formData] as boolean}
                onChange={handleChange}
                className="h-5 w-5 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900 cursor-pointer"
              />
              <label htmlFor={id} className="text-sm text-gray-300 cursor-pointer select-none">{label}</label>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Information Section */}
      <div className={sectionClasses}>
        <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Additional Information</h2>
        
        <div>
          <label htmlFor="project_desc" className={labelClasses}>Project Description</label>
          <textarea
            id="project_desc"
            name="project_desc"
            value={formData.project_desc}
            onChange={handleChange}
            rows={4}
            placeholder="Enter project description"
            className={`${inputClasses} resize-y min-h-[100px]`}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 mt-6">
          {[
            { id: 'github_url', label: 'GitHub URL', type: 'url', placeholder: 'https://github.com/...' },
            { id: 'twitter_url', label: 'Twitter URL', type: 'url', placeholder: 'https://twitter.com/...' },
            { id: 'dexscreener_url', label: 'DexScreener URL', type: 'url', placeholder: 'https://dexscreener.com/...' },
            { id: 'image_url', label: 'Image URL', type: 'url', placeholder: 'https://...' },
          ].map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label htmlFor={id} className={labelClasses}>{label}</label>
              <input
                type={type}
                id={id}
                name={id}
                value={formData[id as keyof typeof formData] as string}
                onChange={handleChange}
                placeholder={placeholder}
                className={inputClasses}
              />
            </div>
          ))}
          <div>
            <label htmlFor="framework" className={labelClasses}>Ecosystem</label>
            <select
              id="framework"
              name="framework"
              value={isCustomFramework ? 'custom' : formData.framework}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="">Select an ecosystem</option>
              {PRESET_ECOSYSTEMS.map((ecosystem) => (
                <option key={ecosystem} value={ecosystem}>{ecosystem}</option>
              ))}   
              <option value="custom">Add New Ecosystem</option>
            </select>
            {isCustomFramework && (
              <input
                type="text"
                id="framework-custom"
                name="framework"
                value={customFramework}
                onChange={handleChange}
                placeholder="Enter new ecosystem name"
                className={`${inputClasses} mt-2`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}
      
      {statusMessage && (
        <div className="rounded-md bg-blue-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <div className="text-sm text-blue-700">{statusMessage}</div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <div className="mt-2 text-sm text-green-700">
                Your token has been successfully added.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            'Add Token (1000 CYBR)'
          )}
        </button>
      </div>
    </form>
  );
};

export default AddTokenForm; 