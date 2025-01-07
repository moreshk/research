interface RepoData {
  publicData: {
    commitFrequency: {
      monthly: number;
    };
    openPullRequestsCount: number;
    closedPullRequestsCount: number;
    contributorsCount: number;
    starsCount: number;
    forksCount: number;
    openIssuesCount: number;
    closedIssuesCount: number;
    license: any;
    updatedAt: string;
    description: string;
    topics: string[];
  };
  authenticatedData?: any;
}

export function calculateCyberIndex(publicData: RepoData['publicData'], authenticatedData?: RepoData['authenticatedData']): number {
  // Base metrics (max 100 points)
  const metrics = {
    // Activity & Development (40 points)
    activity: {
      commits: Math.min(publicData.commitFrequency.monthly / 300, 1) * 15, // Max 15 points
      prs: Math.min((publicData.openPullRequestsCount + publicData.closedPullRequestsCount) / 50, 1) * 15, // Max 15 points
      contributors: Math.min(publicData.contributorsCount / 30, 1) * 10, // Max 10 points
    },
    
    // Community & Adoption (40 points)
    community: {
      stars: Math.min(publicData.starsCount / 10000, 1) * 20, // Max 20 points
      forks: Math.min(publicData.forksCount / 1000, 1) * 10, // Max 10 points
      issues: Math.min((publicData.openIssuesCount + publicData.closedIssuesCount) / 100, 1) * 10, // Max 10 points
    },
    
    // Project Health (20 points)
    health: {
      hasLicense: publicData.license ? 5 : 0, // 5 points
      recentActivity: new Date().getTime() - new Date(publicData.updatedAt).getTime() < 30 * 24 * 60 * 60 * 1000 ? 5 : 0, // 5 points
      hasDescription: publicData.description ? 5 : 0, // 5 points
      hasTopics: publicData.topics.length > 0 ? 5 : 0 // 5 points
    }
  };

  // Calculate total (0-100)
  const total = Object.values(metrics).reduce(
    (sum, category) => sum + Object.values(category).reduce((s, v) => s + v, 0),
    0
  );

  return Math.round(total);
} 