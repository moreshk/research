'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { formatDistance } from 'date-fns';
import { calculateCyberIndex } from '@/utils/calculateCyberIndex';

interface RepoData {
  publicData: {
    starsCount: number;
    forksCount: number;
    openIssuesCount: number;
    closedIssuesCount: number;
    openPullRequestsCount: number;
    closedPullRequestsCount: number;
    contributorsCount: number;
    releasesCount: number;
    license: { name: string } | null;
    description: string;
    topics: string[];
    defaultBranch: string;
    primaryLanguage: string;
    createdAt: string;
    updatedAt: string;
    isArchived: boolean;
    hasWiki: boolean;
    hasIssues: boolean;
    commitFrequency: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
  authenticatedData?: {
    traffic: {
      views: Array<{ timestamp: string; count: number; uniques: number }>;
      clones: Array<{ timestamp: string; count: number; uniques: number }>;
    };
    codeFrequency: Array<[number, number, number]>;
    commitActivity: Array<{
      total: number;
      week: number;
      days: number[];
    }>;
    deploymentFrequency: {
      daily: number;
      weekly: number;
      monthly: number;
    };
    pullRequestReviewStats: {
      averageTimeToMerge: number;
      mergeRate: number;
      reviewsPerPR: number;
    };
  };
}

export default function RepoPage() {
  const params = useParams();
  const owner = params?.owner as string;
  const name = params?.name as string;
  const [repoData, setRepoData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRepoData() {
      if (!owner || !name) {
        setError('Invalid repository parameters');
        setLoading(false);
        return;
      }

      try {
        const repoUrl = `https://github.com/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`;
        const response = await fetch(`/api/github-repo-info?repo=${encodeURIComponent(repoUrl)}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch repository data: ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        
        setRepoData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load repository data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRepoData();
  }, [owner, name]);

  console.log('Params:', { owner, name });

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!repoData) return <div className="p-8">No repository data available</div>;

  const { publicData, authenticatedData } = repoData;
  const cyberIndex = calculateCyberIndex(publicData, authenticatedData);

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold">
            {owner}/{name}
          </h1>
          <a 
            href={`https://github.com/${owner}/${name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-400 hover:text-blue-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            View on GitHub
          </a>
        </div>
        <p className="text-gray-400">{publicData.description}</p>
      </div>

      {/* Cyber Index Score */}
      <div className="bg-gray-800 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Github Score</h2>
        <div className="flex items-center gap-4">
          <div className="text-5xl font-bold text-blue-400">{cyberIndex}</div>
          <div className="text-gray-400">
            <div>out of 100</div>
            <div className="text-sm">Based on activity, community engagement, and project health</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Stats */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Repository Stats</h2>
          <div className="space-y-2">
            <div>Stars: {publicData.starsCount}</div>
            <div>Forks: {publicData.forksCount}</div>
            <div>Contributors: {publicData.contributorsCount}</div>
            <div>Primary Language: {publicData.primaryLanguage}</div>
          </div>
        </div>

        {/* Issues & PRs */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Issues & Pull Requests</h2>
          <div className="space-y-2">
            <div>Open Issues: {publicData.openIssuesCount}</div>
            <div>Closed Issues: {publicData.closedIssuesCount}</div>
            <div>Open PRs: {publicData.openPullRequestsCount}</div>
            <div>Closed PRs: {publicData.closedPullRequestsCount}</div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Activity</h2>
          <div className="space-y-2">
            <div>Daily Commits: {publicData.commitFrequency.daily.toFixed(1)}</div>
            <div>Weekly Commits: {publicData.commitFrequency.weekly.toFixed(1)}</div>
            <div>Monthly Commits: {publicData.commitFrequency.monthly.toFixed(1)}</div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Repository Info</h2>
          <div className="space-y-2">
            <div>License: {publicData.license?.name || 'No license'}</div>
            <div>Created: {formatDistance(new Date(publicData.createdAt), new Date(), { addSuffix: true })}</div>
            <div>Last Updated: {formatDistance(new Date(publicData.updatedAt), new Date(), { addSuffix: true })}</div>
          </div>
        </div>

        {/* Authenticated Data (if available) */}
        {authenticatedData && (
          <>
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Traffic (Last 14 days)</h2>
              <div className="space-y-2">
                <div>Total Views: {authenticatedData.traffic.views.reduce((sum, view) => sum + view.count, 0)}</div>
                <div>Unique Views: {authenticatedData.traffic.views.reduce((sum, view) => sum + view.uniques, 0)}</div>
                <div>Total Clones: {authenticatedData.traffic.clones.reduce((sum, clone) => sum + clone.count, 0)}</div>
                <div>Unique Clones: {authenticatedData.traffic.clones.reduce((sum, clone) => sum + clone.uniques, 0)}</div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">PR Review Stats</h2>
              <div className="space-y-2">
                <div>Average Time to Merge: {authenticatedData.pullRequestReviewStats.averageTimeToMerge.toFixed(1)} hours</div>
                <div>Merge Rate: {authenticatedData.pullRequestReviewStats.mergeRate.toFixed(1)}%</div>
                <div>Reviews per PR: {authenticatedData.pullRequestReviewStats.reviewsPerPR.toFixed(1)}</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Topics */}
      {publicData.topics.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Topics</h2>
          <div className="flex flex-wrap gap-2">
            {publicData.topics.map(topic => (
              <span key={topic} className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
