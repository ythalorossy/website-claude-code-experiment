export interface DevToArticle {
  title: string;
  description: string;
  url: string;
  positive_reactions_count: number;
  reading_time_minutes: number;
  published_at: string;
  tag_list: string[];
  username: string;
}

async function fetchUserArticles(username: string): Promise<DevToArticle[]> {
  try {
    const res = await fetch(
      `https://dev.to/api/articles?username=${username}`,
      {
        headers: {
          Accept: 'application/json',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) {
      console.error(`Dev.to API error for user ${username}: ${res.status} ${res.statusText}`);
      return [];
    }

    const articles = (await res.json()) as DevToArticle[];
    return articles.map(article => ({ ...article, username }));
  } catch (error) {
    console.error(`Failed to fetch Dev.to articles for user ${username}:`, error);
    return [];
  }
}

export async function getDevToArticles(limit = 30): Promise<DevToArticle[]> {
  const usernamesEnv = process.env.DEV_TO_USERNAMES;

  if (!usernamesEnv) {
    return [];
  }

  const usernames = usernamesEnv.split(',').map(u => u.trim()).filter(Boolean);

  if (usernames.length === 0) {
    return [];
  }

  const results = await Promise.all(usernames.map(fetchUserArticles));
  const allArticles = results.flat();

  return allArticles.sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  ).slice(0, limit);
}
