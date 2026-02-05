import axios from 'axios';
import * as cheerio from 'cheerio';

interface GovtWebsite {
  url: string;
  name: string;
  selector: string;
}

const GOVT_WEBSITES: GovtWebsite[] = [
  { url: 'https://upsc.gov.in', name: 'UPSC', selector: '.whats-new-list' },
  { url: 'https://ssc.nic.in', name: 'SSC', selector: '.notification-table' },
  { url: 'https://www.ibps.in', name: 'IBPS', selector: '.latest-notification' },
];

interface ScrapedJob {
  source: string;
  sourceUrl: string;
  title: string;
  link: string;
  description?: string;
  type: 'scrape';
  scrapedAt: string;
}

export async function scrapeGovtWebsites(): Promise<ScrapedJob[]> {
  const results: ScrapedJob[] = [];
  
  for (const website of GOVT_WEBSITES) {
    try {
      // Respectful scraping: wait before each request
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const response = await axios.get(website.url, {
        headers: {
          'User-Agent': 'SarkariAlertsBot/1.0 (+https://yoursite.com/bot)',
          'Accept': 'text/html',
        },
        timeout: 15000,
      });
      
      const $ = cheerio.load(response.data);
      const items = $(website.selector).find('a');
      
      items.each((i, elem) => {
        const title = $(elem).text().trim();
        const link = $(elem).attr('href') || '';
        
        if (title && link) {
          results.push({
            source: website.name,
            sourceUrl: website.url,
            title,
            link: link.startsWith('http') ? link : `${website.url}${link}`,
            type: 'scrape',
            scrapedAt: new Date().toISOString(),
          });
        }
      });
      
      console.log(`✅ Scraped ${items.length} items from ${website.name}`);
    } catch (error) {
      console.error(`❌ Failed to scrape ${website.name}:`, error);
    }
  }
  
  return results;
}
