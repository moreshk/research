import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Get PAT from environment variable
const GITHUB_PAT = process.env.GITHUB_PAT;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const repoUrl = searchParams.get('repo');

  if (!repoUrl) {
    return NextResponse.json({ error: 'Repository URL is required' }, { status: 400 });
  }

  const { owner, repo } = parseGitHubUrl(repoUrl);
  if (!owner || !repo) {
    return NextResponse.json({ error: 'Invalid GitHub repository URL' }, { status: 400 });
  }

  try {
    // If PAT exists, fetch both public and authenticated data
    // If not, fetch only public data
    if (GITHUB_PAT) {
      const data = await fetchAllRepoData(owner, repo, GITHUB_PAT);
      return NextResponse.json(data);
    } else {
      const publicData = await fetchPublicRepoData(owner, repo);
      return NextResponse.json({ publicData });
    }
  } catch (error) {
    console.error('Error fetching repository data:', error);
    return NextResponse.json({ error: 'Failed to fetch repository data' }, { status: 500 });
  }
}

async function fetchAllRepoData(owner: string, repo: string, pat: string) {
  const octokit = new Octokit({ auth: pat });

  try {
    // First fetch the basic public data
    const [
      repoData,
      issuesData,
      pullsData,
      contributorsData,
      releasesData,
      commitsData,
    ] = await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.issues.listForRepo({ owner, repo, state: 'all' }),
      octokit.pulls.list({ owner, repo, state: 'all' }),
      octokit.repos.listContributors({ owner, repo }),
      octokit.repos.listReleases({ owner, repo }),
      octokit.repos.listCommits({ owner, repo })
    ]);

    // Try to fetch authenticated data, but don't fail if we don't have permissions
    let authenticatedData = {};
    try {
      const [
        trafficData,
        clonesData,
        codeFrequencyData,
        commitActivityData,
        deploymentData
      ] = await Promise.all([
        octokit.repos.getViews({ owner, repo }).catch(() => ({ data: { views: [] } })),
        octokit.repos.getClones({ owner, repo }).catch(() => ({ data: { clones: [] } })),
        octokit.repos.getCodeFrequencyStats({ owner, repo }).catch(() => ({ data: [] })),
        octokit.repos.getCommitActivityStats({ owner, repo }).catch(() => ({ data: [] })),
        octokit.repos.listDeployments({ owner, repo }).catch(() => ({ data: [] }))
      ]);

      authenticatedData = {
        traffic: {
          views: trafficData.data.views,
          clones: clonesData.data.clones
        },
        codeFrequency: codeFrequencyData.data,
        commitActivity: commitActivityData.data,
        deploymentFrequency: calculateDeploymentFrequency(deploymentData.data),
        pullRequestReviewStats: calculatePullRequestStats(pullsData.data)
      };
    } catch (error) {
      console.warn('Failed to fetch some authenticated data:', error);
      // Continue with just the public data
    }

    return {
      publicData: {
        starsCount: repoData.data.stargazers_count,
        forksCount: repoData.data.forks_count,
        openIssuesCount: repoData.data.open_issues_count,
        closedIssuesCount: issuesData.data.filter(issue => issue.state === 'closed').length,
        openPullRequestsCount: pullsData.data.filter(pr => pr.state === 'open').length,
        closedPullRequestsCount: pullsData.data.filter(pr => pr.state === 'closed').length,
        contributorsCount: contributorsData.data.length,
        releasesCount: releasesData.data.length,
        license: repoData.data.license,
        description: repoData.data.description,
        topics: repoData.data.topics,
        defaultBranch: repoData.data.default_branch,
        primaryLanguage: repoData.data.language,
        createdAt: repoData.data.created_at,
        updatedAt: repoData.data.updated_at,
        isArchived: repoData.data.archived,
        hasWiki: repoData.data.has_wiki,
        hasIssues: repoData.data.has_issues,
        commitFrequency: calculateCommitFrequency(commitsData.data)
      },
      authenticatedData
    };
  } catch (error) {
    console.error('Error fetching repository data:', error);
    // If we fail to fetch with PAT, try falling back to public data
    return { publicData: await fetchPublicRepoData(owner, repo) };
  }
}

function parseGitHubUrl(url: string): { owner: string | null; repo: string | null } {
  try {
    // Handle different GitHub URL formats
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    
    if (urlObj.hostname === 'github.com' && pathParts.length >= 2) {
      return {
        owner: pathParts[0],
        repo: pathParts[1].replace('.git', '') // Remove .git if present
      };
    }
  } catch (error) {
    // Handle invalid URLs
    console.error('Error parsing GitHub URL:', error);
  }
  
  return { owner: null, repo: null };
}

function calculateCommitFrequency(commits: any[]) {
  if (!commits.length) return { daily: 0, weekly: 0, monthly: 0 };

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  const commitDates = commits.map(commit => new Date(commit.commit.author.date).getTime());
  const oldestCommit = Math.min(...commitDates);
  const timeSpan = now.getTime() - oldestCommit;

  // Calculate frequencies
  const daily = (commits.length / (timeSpan / oneDay));
  const weekly = (commits.length / (timeSpan / oneWeek));
  const monthly = (commits.length / (timeSpan / oneMonth));

  return {
    daily: parseFloat(daily.toFixed(2)),
    weekly: parseFloat(weekly.toFixed(2)),
    monthly: parseFloat(monthly.toFixed(2))
  };
}

function calculateDeploymentFrequency(deployments: any[]) {
  if (!deployments.length) return { daily: 0, weekly: 0, monthly: 0 };

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  const oneMonth = 30 * oneDay;

  const deploymentDates = deployments.map(deploy => new Date(deploy.created_at).getTime());
  const oldestDeployment = Math.min(...deploymentDates);
  const timeSpan = now.getTime() - oldestDeployment;

  // Calculate frequencies
  const daily = (deployments.length / (timeSpan / oneDay));
  const weekly = (deployments.length / (timeSpan / oneWeek));
  const monthly = (deployments.length / (timeSpan / oneMonth));

  return {
    daily: parseFloat(daily.toFixed(2)),
    weekly: parseFloat(weekly.toFixed(2)),
    monthly: parseFloat(monthly.toFixed(2))
  };
}

function calculatePullRequestStats(pullRequests: any[]) {
  if (!pullRequests.length) return {
    averageTimeToMerge: 0,
    mergeRate: 0,
    reviewsPerPR: 0
  };

  const mergedPRs = pullRequests.filter(pr => pr.merged_at);
  const totalReviews = pullRequests.reduce((sum, pr) => sum + (pr.review_comments || 0), 0);

  // Calculate average time to merge (in hours)
  const timeToMerge = mergedPRs.map(pr => {
    const created = new Date(pr.created_at).getTime();
    const merged = new Date(pr.merged_at).getTime();
    return (merged - created) / (1000 * 60 * 60); // Convert to hours
  });

  const averageTimeToMerge = timeToMerge.length 
    ? timeToMerge.reduce((sum, time) => sum + time, 0) / timeToMerge.length 
    : 0;

  return {
    averageTimeToMerge: parseFloat(averageTimeToMerge.toFixed(2)),
    mergeRate: parseFloat((mergedPRs.length / pullRequests.length * 100).toFixed(2)),
    reviewsPerPR: parseFloat((totalReviews / pullRequests.length).toFixed(2))
  };
}

async function fetchPublicRepoData(owner: string, repo: string) {
  const octokit = new Octokit();

  const [repoData, issuesData, pullsData, contributorsData, releasesData, commitsData] = 
    await Promise.all([
      octokit.repos.get({ owner, repo }),
      octokit.issues.listForRepo({ owner, repo, state: 'all' }),
      octokit.pulls.list({ owner, repo, state: 'all' }),
      octokit.repos.listContributors({ owner, repo }),
      octokit.repos.listReleases({ owner, repo }),
      octokit.repos.listCommits({ owner, repo })
    ]);

  return {
    starsCount: repoData.data.stargazers_count,
    forksCount: repoData.data.forks_count,
    openIssuesCount: repoData.data.open_issues_count,
    closedIssuesCount: issuesData.data.filter(issue => issue.state === 'closed').length,
    openPullRequestsCount: pullsData.data.filter(pr => pr.state === 'open').length,
    closedPullRequestsCount: pullsData.data.filter(pr => pr.state === 'closed').length,
    contributorsCount: contributorsData.data.length,
    releasesCount: releasesData.data.length,
    license: repoData.data.license,
    description: repoData.data.description,
    topics: repoData.data.topics,
    defaultBranch: repoData.data.default_branch,
    primaryLanguage: repoData.data.language,
    createdAt: repoData.data.created_at,
    updatedAt: repoData.data.updated_at,
    isArchived: repoData.data.archived,
    hasWiki: repoData.data.has_wiki,
    hasIssues: repoData.data.has_issues,
    commitFrequency: calculateCommitFrequency(commitsData.data)
  };
}

// Optional: Add error handling wrapper
async function safeApiCall<T>(
  apiCall: Promise<T>, 
  errorMessage: string = 'API call failed'
): Promise<T | null> {
  try {
    return await apiCall;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    return null;
  }
}

// Optional: Add rate limiting helper
const rateLimiter = {
  lastCall: 0,
  minInterval: 1000, // minimum time between calls in ms

  async throttle() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCall;
    
    if (timeSinceLastCall < this.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, this.minInterval - timeSinceLastCall)
      );
    }
    
    this.lastCall = Date.now();
  }
}; 