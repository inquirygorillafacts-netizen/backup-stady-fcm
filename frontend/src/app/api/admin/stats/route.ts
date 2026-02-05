import { NextRequest, NextResponse } from 'next/server';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    // Get system stats
    const logsRef = collection(db, 'system_logs');
    const logsQuery = query(
      logsRef,
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    const logsSnapshot = await getDocs(logsQuery);
    const logs = logsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as any[];
    
    // Get jobs count
    const jobsRef = collection(db, 'jobs');
    const jobsSnapshot = await getDocs(query(jobsRef, limit(1000)));
    
    const stats = {
      totalJobs: jobsSnapshot.size,
      recentLogs: logs,
      lastRun: logs[0]?.timestamp || null,
      health: logs.length > 0 ? 'healthy' : 'unknown',
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
