import crypto from 'crypto';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

export function createContentHash(title: string, organization: string, lastDate: string): string {
  return crypto
    .createHash('sha256')
    .update(`${title}|${organization}|${lastDate}`)
    .digest('hex');
}

export async function deduplicateJobs(scrapedJobs: any[]): Promise<any[]> {
  const uniqueJobs: any[] = [];
  const seenHashes = new Set<string>();
  
  for (const job of scrapedJobs) {
    const contentHash = createContentHash(
      job.title,
      job.organization || '',
      job.lastDate || ''
    );
    
    // Check if already exists in database
    try {
      const jobsRef = collection(db, 'jobs');
      const q = query(jobsRef, where('contentHash', '==', contentHash));
      const existingJob = await getDocs(q);
      
      if (existingJob.empty && !seenHashes.has(contentHash)) {
        job.contentHash = contentHash;
        uniqueJobs.push(job);
        seenHashes.add(contentHash);
      } else {
        console.log(`⚠️ Duplicate found: ${job.title}`);
      }
    } catch (error) {
      console.error('Error checking duplicates:', error);
      // If error, still add to avoid losing data
      job.contentHash = contentHash;
      uniqueJobs.push(job);
    }
  }
  
  return uniqueJobs;
}
