import { parseRSSFeeds } from './rss-parser';
import { scrapeGovtWebsites } from './web-scraper';
import { deduplicateJobs } from './deduplicator';
import { verifyJobWithAI } from '../gemini';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function runAutomationPipeline() {
  console.log('🤖 Starting automation pipeline...');
  const startTime = Date.now();
  
  try {
    // Step 1: Data Collection
    console.log('📥 Step 1: Collecting data from sources...');
    const [rssJobs, scrapedJobs] = await Promise.all([
      parseRSSFeeds(),
      scrapeGovtWebsites(),
    ]);
    
    const allJobs = [...rssJobs, ...scrapedJobs];
    console.log(`✅ Collected ${allJobs.length} total items`);
    
    // Step 2: Deduplication
    console.log('🔍 Step 2: Removing duplicates...');
    const uniqueJobs = await deduplicateJobs(allJobs);
    console.log(`✅ ${uniqueJobs.length} unique jobs found`);
    
    // Step 3: AI Verification
    console.log('🤖 Step 3: AI verification...');
    const verifiedJobs = [];
    
    for (const job of uniqueJobs.slice(0, 10)) { // Process first 10 for demo
      try {
        const verification = await verifyJobWithAI(job);
        
        if (verification.confidence >= 70 && verification.isLegitimate) {
          verifiedJobs.push({
            ...job,
            ...verification.extracted,
            category: verification.category,
            aiConfidence: verification.confidence,
            status: 'active',
          });
        }
      } catch (error) {
        console.error('Verification error:', error);
      }
    }
    
    console.log(`✅ ${verifiedJobs.length} jobs verified`);
    
    // Step 4: Save to Firestore
    console.log('💾 Step 4: Saving to database...');
    const jobsRef = collection(db, 'jobs');
    
    for (const job of verifiedJobs) {
      try {
        await addDoc(jobsRef, {
          ...job,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        console.error('Error saving job:', error);
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ Automation pipeline completed in ${duration}s`);
    
    // Log to system_logs
    await addDoc(collection(db, 'system_logs'), {
      type: 'scrape_run',
      timestamp: serverTimestamp(),
      duration: parseFloat(duration),
      itemsCollected: allJobs.length,
      itemsProcessed: uniqueJobs.length,
      itemsApproved: verifiedJobs.length,
    });
    
    return {
      success: true,
      itemsCollected: allJobs.length,
      itemsVerified: verifiedJobs.length,
    };
  } catch (error) {
    console.error('❌ Automation pipeline failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
