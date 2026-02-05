// Razorpay Integration for Form Filling Service

export interface FormFillingOrder {
  amount: number; // in paise (₹300 = 30000 paise)
  jobTitle: string;
  jobId: string;
  userEmail: string;
  userName: string;
  userPhone: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

// Load Razorpay script dynamically
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Calculate amount based on form complexity
export function calculateFormFillingFee(category: string): number {
  const feeStructure: { [key: string]: number } = {
    'Railway': 300,
    'SSC': 350,
    'Banking': 400,
    'UPSC': 750,
    'State PSC': 500,
    'Defense': 300,
    'Teaching': 250,
    'Police': 250,
    'default': 300,
  };

  return feeStructure[category] || feeStructure['default'];
}

// Format amount for display
export function formatCurrency(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}
