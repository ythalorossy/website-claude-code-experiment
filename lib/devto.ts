export interface DevToArticle {
  title: string;
  description: string;
  url: string;
  positive_reactions_count: number;
  reading_time_minutes: number;
  published_at: string;
  tag_list: string[];
}

export async function getDevToArticles(limit = 6): Promise<DevToArticle[]> {
  const username = process.env.DEV_TO_USERNAME;

  if (!username) {
    return [];
  }

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
      console.error(`Dev.to API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data: DevToArticle[] = await res.json();
    return data.slice(0, limit);
  } catch (error) {
    console.error('Failed to fetch Dev.to articles:', error);
    return [];
  }
}
