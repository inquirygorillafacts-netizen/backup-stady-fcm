'use client';

import { useState, useEffect } from 'react';
import { Lock, Delete, Check } from 'lucide-react';
import { toast } from 'sonner';

interface AppLockScreenProps {
  onUnlock: () => void;
}

export function AppLockScreen({ onUnlock }: AppLockScreenProps) {
  const [pin, setPin] = useState('');
  const [savedPin, setSavedPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('appLockPin');
    if (stored) {
      setSavedPin(stored);
    }
  }, []);

  useEffect(() => {
    if (pin.length === 4) {
      verifyPin();
    }
  }, [pin]);

  const verifyPin = () => {
    if (pin === savedPin) {
      toast.success('स्वागत है! Welcome!');
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      
      if (newAttempts >= 3) {
        setLocked(true);
        toast.error('Too many attempts! Contact helpline.');
      } else {
        toast.error(`Wrong PIN! ${3 - newAttempts} attempts left`);
      }
      
      setPin('');
    }
  };

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleForgotPin = () => {
    toast.info('Please contact helpline: +91 98765 43210');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
      <div className="max-w-md w-full space-y-8">
        {/* Lock Icon */}
        <div className="text-center space-y-4">
          <div className="inline-flex p-6 bg-white/20 backdrop-blur-lg rounded-full shadow-2xl">
            <Lock className="w-16 h-16 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-lg">
            Enter PIN
          </h1>
          <p className="text-blue-100">
            Enter your 4-digit PIN to unlock
          </p>
        </div>

        {/* PIN Display */}
        <div className="flex justify-center gap-4 py-8">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold transition-all ${
                pin.length > index
                  ? 'bg-white text-blue-600 scale-110'
                  : 'bg-white/20 backdrop-blur-lg text-white/40'
              }`}
            >
              {pin.length > index ? '•' : ''}
            </div>
          ))}
        </div>

        {/* Number Pad */}
        {!locked && (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white text-2xl font-bold rounded-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="h-16 bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white rounded-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Delete className="w-6 h-6" />
            </button>
            <button
              onClick={() => handleNumberClick('0')}
              className="h-16 bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white text-2xl font-bold rounded-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl"
            >
              0
            </button>
            <button
              onClick={handleDelete}
              className="h-16 bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white rounded-2xl transition-all active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center"
            >
              <Check className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* Forgot PIN */}
        <div className="text-center">
          <button
            onClick={handleForgotPin}
            className="text-white hover:text-blue-100 font-medium underline"
          >
            Forgot PIN?
          </button>
        </div>

        {locked && (
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-400 rounded-2xl p-6 text-center space-y-3">
            <p className="text-white font-semibold">
              App Locked Due to Multiple Failed Attempts
            </p>
            <p className="text-red-100 text-sm">
              Please contact helpline to reset PIN:
            </p>
            <a
              href="tel:+919876543210"
              className="inline-block bg-white text-red-600 px-6 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors"
            >
              Call Helpline
            </a>
          </div>
        )}
      </div>
    </div>
  );
}