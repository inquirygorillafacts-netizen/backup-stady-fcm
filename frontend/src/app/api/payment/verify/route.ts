import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

// Verify payment signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      jobId,
      jobTitle,
      userEmail,
      userName,
      userPhone,
      amount,
    } = body;

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature', success: false },
        { status: 400 }
      );
    }

    // Save payment record to Firestore
    const paymentRef = collection(db, 'payments');
    await addDoc(paymentRef, {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      jobId,
      jobTitle,
      userEmail,
      userName,
      userPhone: userPhone || '',
      amount,
      status: 'success',
      createdAt: serverTimestamp(),
    });

    // Create form filling request
    const requestsRef = collection(db, 'form_filling_requests');
    await addDoc(requestsRef, {
      jobId,
      jobTitle,
      userEmail,
      userName,
      userPhone: userPhone || '',
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'pending', // pending -> assigned -> in_progress -> completed
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed', success: false },
      { status: 500 }
    );
  }
}
