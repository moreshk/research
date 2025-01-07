"use client";

import React, { useState } from 'react';
import { VALID_CHAINS } from '@/lib/constants';

const AddTokenForm: React.FC = () => {
  const [formData, setFormData] = useState({
    contract_address: '',
    chain: '',
    name: '',
    symbol: '',
    description: '',
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

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setError(null);
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error('This token already exists in the database');
        }
        throw new Error(data.error || 'Failed to add token');
      }

      setSuccess(true);
      setFormData({
        contract_address: '',
        chain: '',
        name: '',
        symbol: '',
        description: '',
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
      }, 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const inputClasses = "mt-2 block w-full rounded-md bg-gray-800 border-gray-700 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-2 py-2.5 px-3 text-base cursor-text transition-colors duration-200";
  const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
  const sectionClasses = "space-y-6 bg-gray-900/50 p-6 rounded-lg";

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
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

      {/* Basic Information Section */}
      <div className={sectionClasses}>
        <h2 className="text-xl font-semibold text-white border-b border-gray-700 pb-2 mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <label htmlFor="name" className={labelClasses}>Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Token name"
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="symbol" className={labelClasses}>Symbol</label>
            <input
              type="text"
              id="symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              placeholder="Token symbol"
              className={inputClasses}
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="description" className={labelClasses}>Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Enter token description"
            className={`${inputClasses} resize-y min-h-[100px]`}
          />
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
            { id: 'framework', label: 'Framework', type: 'text', placeholder: 'Enter framework' },
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
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="rounded-md bg-red-900/50 p-4 border border-red-700">
          <p className="text-sm text-red-400 flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        </div>
      )}
      
      {success && (
        <div className="rounded-md bg-green-900/50 p-4 border border-green-700">
          <p className="text-sm text-green-400 flex items-center">
            <svg className="h-5 w-5 text-green-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Token added successfully!
          </p>
        </div>
      )}

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={success}
        >
          {success ? 'Token added successfully' : 'Add Token'}
        </button>
      </div>
    </form>
  );
};

export default AddTokenForm; 