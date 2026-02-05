import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

// Create Razorpay order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, jobId, jobTitle, userEmail, userName, userPhone } = body;

    // Validate inputs
    if (!amount || !jobId || !userEmail || !userName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create order (in production, call Razorpay API)
    // For now, we'll create a mock order ID
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // In production, use Razorpay API:
    /*
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `receipt_${jobId}_${Date.now()}`,
        notes: {
          jobId,
          jobTitle,
          userEmail,
          userName,
        }
      })
    });
    const orderData = await response.json();
    */

    return NextResponse.json({
      success: true,
      orderId: orderId,
      amount: amount,
      key: RAZORPAY_KEY_ID,
      currency: 'INR',
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
