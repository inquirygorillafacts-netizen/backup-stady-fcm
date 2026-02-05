'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Sparkles, 
  Target, 
  BookOpen, 
  Users, 
  ArrowRight,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { authAPI } from '@/lib/api';

const ONBOARDING_STEPS = [
  {
    icon: Sparkles,
    title: 'Stady में आपका स्वागत है!',
    description: 'हम आपकी सरकारी नौकरी की तैयारी में मदद करेंगे। यहाँ आपको मिलेगा सब कुछ जो आपको सफल होने के लिए चाहिए।',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Target,
    title: 'हमारा Vision',
    description: 'हर छात्र को सही समय पर सही जानकारी मिले। कोई भी अवसर न छूटे और तैयारी हो सबसे बेहतरीन।',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: BookOpen,
    title: 'हमारी Services',
    description: 'Live Job Forms Tracking, AI Study Assistant, Smart Notifications, Community Groups, और भी बहुत कुछ - सब एक ही जगह।',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Users,
    title: 'आपका फायदा',
    description: 'समय की बचत, बेहतर तैयारी, कम्युनिटी सपोर्ट, और सबसे महत्वपूर्ण - कोई भी फॉर्म या अपडेट मिस नहीं होगा।',
    color: 'from-orange-500 to-orange-600'
  },
  {
    icon: Check,
    title: 'तैयार हैं?',
    description: 'अब आप Stady के सभी features use कर सकते हैं। चलिए शुरू करते हैं आपकी सफलता की यात्रा!',
    color: 'from-pink-500 to-pink-600'
  }
];

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();
  const { refreshUserData } = useAuth();

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    try {
      // Update dummy user's onboarding status
      const dummyUser = localStorage.getItem('dummyUser');
      if (dummyUser) {
        const parsed = JSON.parse(dummyUser);
        parsed.userData.onboarding_completed = true;
        localStorage.setItem('dummyUser', JSON.stringify(parsed));
      }
      
      await refreshUserData();
      toast.success('Welcome to Stady! 🎉');
      router.push('/student');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Something went wrong');
    }
  };

  const step = ONBOARDING_STEPS[currentStep];
  const Icon = step.icon;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-lg w-full space-y-8">
        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2">
          {ONBOARDING_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'w-8 bg-blue-500'
                  : index < currentStep
                  ? 'w-2 bg-blue-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 space-y-6 animate-fade-in">
          {/* Icon */}
          <div className="flex justify-center">
            <div className={`p-6 rounded-2xl bg-gradient-to-br ${step.color} shadow-lg`}>
              <Icon className="w-12 h-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
            {step.title}
          </h2>

          {/* Description */}
          <p className="text-center text-gray-600 dark:text-gray-300 leading-relaxed">
            {step.description}
          </p>

          {/* Action Button */}
          <button
            onClick={handleNext}
            className={`w-full flex items-center justify-center gap-2 bg-gradient-to-r ${step.color} text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95`}
          >
            {currentStep < ONBOARDING_STEPS.length - 1 ? (
              <>
                Next
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                शुरू करें
                <Check className="w-5 h-5" />
              </>
            )}
          </button>
        </div>

        {/* Step Counter */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
          Step {currentStep + 1} of {ONBOARDING_STEPS.length}
        </p>
      </div>
    </div>
  );
}