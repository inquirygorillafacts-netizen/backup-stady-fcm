import Parser from 'rss-parser';

const RSS_SOURCES = [
  'https://govtjobsblog.in/feed',
  'https://haryanajobs.in/category/latest-jobs/feed',
  'https://indiajoblive.com/feed',
  'https://sarkarinauk riblog.com/feed',
  'https://careerpower.in/blog/feed',
];

interface RSSJob {
  source: string;
  title: string;
  link: string;
  description: string;
  publishDate: string;
  rawContent: string;
  scrapedAt: string;
  type: 'rss';
}

export async function parseRSSFeeds(): Promise<RSSJob[]> {
  const parser = new Parser();
  const results: RSSJob[] = [];
  
  for (const feedUrl of RSS_SOURCES) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      feed.items.forEach(item => {
        results.push({
          source: feedUrl,
          title: item.title || '',
          link: item.link || '',
          description: item.contentSnippet || '',
          publishDate: item.pubDate || new Date().toISOString(),
          rawContent: item.content || '',
          scrapedAt: new Date().toISOString(),
          type: 'rss',
        });
      });
      
      console.log(`✅ Parsed ${feed.items.length} items from ${feedUrl}`);
    } catch (error) {
      console.error(`❌ Failed to parse ${feedUrl}:`, error);
    }
  }
  
  return results;
}
