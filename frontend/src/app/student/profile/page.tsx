'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppLock } from '@/contexts/AppLockContext';
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  Save,
  Settings as SettingsIcon,
  HelpCircle,
  Lock,
  Sun,
  Moon,
  Bell,
  Shield,
  LogOut,
  MessageSquare,
  PhoneCall,
  Send,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { usersAPI } from '@/lib/api';
import { useTheme } from '@/components/ThemeProvider';

export default function ProfilePage() {
  const { userData, signOut, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'helpline'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
      });
    }
  }, [userData]);

  const handleSave = async () => {
    try {
      await usersAPI.updateProfile(formData);
      await refreshUserData();
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  if (!userData) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-bold">
            {userData.photo ? (
              <img src={userData.photo} alt={userData.name} className="w-24 h-24 rounded-full" />
            ) : (
              userData.name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-2">{userData.name}</h1>
            <p className="text-blue-100 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              {userData.email}
            </p>
            <div className="mt-2 flex gap-2">
              {userData.roles?.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'settings', label: 'Settings', icon: SettingsIcon },
            { id: 'helpline', label: 'Helpline', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <ProfileTab
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              handleSave={handleSave}
              userData={userData}
            />
          )}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'helpline' && <HelplineTab />}
        </div>
      </div>
    </div>
  );
}

// Profile Tab
function ProfileTab({ formData, setFormData, isEditing, setIsEditing, handleSave, userData }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={userData.email}
            disabled
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none opacity-60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            disabled={!isEditing}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            placeholder="Enter phone number"
          />
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  const { theme, setTheme } = useTheme();
  const { setLock, removeLock, hasPin } = useAppLock();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');

  const handleSetPin = () => {
    if (pin.length !== 4) {
      toast.error('PIN must be 4 digits');
      return;
    }

    setLock(pin);
    toast.success('App lock enabled successfully!');
    setShowPinModal(false);
    setPin('');
  };

  const handleRemovePin = () => {
    if (confirm('Are you sure you want to remove app lock?')) {
      removeLock();
      toast.success('App lock removed');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>

      <div className="space-y-4">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            ) : (
              <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Theme</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Switch between light and dark mode</p>
            </div>
          </div>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`relative w-14 h-7 rounded-full transition-colors ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute w-5 h-5 bg-white rounded-full top-1 transition-transform ${
                theme === 'dark' ? 'translate-x-8' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Notifications</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Enable push notifications</p>
            </div>
          </div>
          <button className="relative w-14 h-7 rounded-full bg-blue-600">
            <div className="absolute w-5 h-5 bg-white rounded-full top-1 translate-x-8" />
          </button>
        </div>

        {/* App Lock */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">App Lock</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {hasPin ? 'PIN is active' : 'Set PIN to secure app'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasPin && (
              <button
                onClick={handleRemovePin}
                className="text-sm text-red-600 dark:text-red-400 font-medium hover:underline"
              >
                Remove
              </button>
            )}
            <button
              onClick={() => setShowPinModal(true)}
              className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              {hasPin ? 'Change' : 'Set PIN'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Privacy */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Privacy & Security</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your privacy settings</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* PIN Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Set App Lock PIN</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Enter a 4-digit PIN to secure your app
            </p>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 4-digit PIN"
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPinModal(false);
                  setPin('');
                }}
                className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSetPin}
                className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700"
              >
                Set PIN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Helpline Tab
function HelplineTab() {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error('Please enter a message');
      return;
    }
    toast.success('Message sent to owner! They will contact you soon.');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Helpline & Support</h2>

      {/* Contact Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="tel:+919876543210"
          className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
            <PhoneCall className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">Call Owner</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">+91 98765 43210</p>
          </div>
        </a>

        <a
          href="https://wa.me/919876543210"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow"
        >
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white">WhatsApp</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chat with owner</p>
          </div>
        </a>
      </div>

      {/* Message Form */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900 dark:text-white">Send Message to Owner</h3>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue or question..."
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        <button
          onClick={handleSendMessage}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-700"
        >
          <Send className="w-4 h-4" />
          Send Message
        </button>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h3>
        {[
          {
            q: 'How do I get notifications for new forms?',
            a: 'Enable notifications in Settings and allow browser permissions.',
          },
          {
            q: 'How can I reset my app lock PIN?',
            a: 'Contact the owner through the helpline if you forget your PIN.',
          },
          {
            q: 'Are the AI features free?',
            a: 'Yes, all AI features are completely free for students.',
          },
        ].map((faq, idx) => (
          <details
            key={idx}
            className="p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <summary className="font-medium text-gray-900 dark:text-white cursor-pointer">
              {faq.q}
            </summary>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{faq.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
