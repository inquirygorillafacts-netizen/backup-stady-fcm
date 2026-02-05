import { NextRequest, NextResponse } from 'next/server';
import { runAutomationPipeline } from '@/lib/automation/processor';

export async function POST(request: NextRequest) {
  try {
    const result = await runAutomationPipeline();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Automation failed', details: error },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST to trigger automation pipeline',
    endpoint: '/api/automation/run',
  });
}
