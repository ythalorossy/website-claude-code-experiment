export interface GithubRepo {
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
}

export async function getGithubRepos(limit = 6): Promise<GithubRepo[]> {
  const username = process.env.GITHUB_USERNAME;

  if (!username) {
    return [];
  }

  const token = process.env.GITHUB_TOKEN;
  const headers: HeadersInit = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers.Authorization = `token ${token}`;
  }

  try {
    const res = await fetch(
      `https://api.github.com/users/${username}/repos?sort=stars&per_page=${limit}`,
      {
        headers,
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data: GithubRepo[] = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch GitHub repos:', error);
    return [];
  }
}
