import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const limitCount = parseInt(searchParams.get('limit') || '20');
    
    const jobsRef = collection(db, 'jobs');
    let q = query(
      jobsRef,
      where('status', '==', status),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    if (category) {
      q = query(
        jobsRef,
        where('status', '==', status),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
    }
    
    const snapshot = await getDocs(q);
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    
    return NextResponse.json({ jobs, count: jobs.length });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    );
  }
}
