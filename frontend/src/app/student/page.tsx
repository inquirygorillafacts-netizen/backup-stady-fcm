'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  TrendingUp, 
  FileText, 
  CheckCircle, 
  Clock,
  Heart,
  BarChart3,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { formsAPI, likesAPI } from '@/lib/api';
import { toast } from 'sonner';

interface Stats {
  total_forms: number;
  live_forms: number;
  applied_forms: number;
  liked_forms: number;
}

export default function StudentHomePage() {
  const { userData } = useAuth();
  const [stats, setStats] = useState<Stats>({
    total_forms: 0,
    live_forms: 0,
    applied_forms: 0,
    liked_forms: 0,
  });
  const [likedForms, setLikedForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch forms
      const formsRes = await formsAPI.getForms();
      const allForms = formsRes.data || [];
      const liveForms = allForms.filter((f: any) => f.status === 'live');
      
      // Fetch liked forms
      const likedRes = await likesAPI.getMyLikes();
      const liked = likedRes.data || [];

      setStats({
        total_forms: allForms.length,
        live_forms: liveForms.length,
        applied_forms: 0, // This will be tracked separately in production
        liked_forms: liked.length,
      });
      
      setLikedForms(liked.slice(0, 5)); // Show top 5
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const STAT_CARDS = [
    {
      icon: FileText,
      label: 'Total Forms',
      value: stats.total_forms,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: Clock,
      label: 'Live Forms',
      value: stats.live_forms,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400'
    },
    {
      icon: CheckCircle,
      label: 'Applied',
      value: stats.applied_forms,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: Heart,
      label: 'Liked Forms',
      value: stats.liked_forms,
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50 dark:bg-pink-900/20',
      textColor: 'text-pink-600 dark:text-pink-400'
    },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Header - Premium 3D Style */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2 drop-shadow-lg">
            स्वागत है, {userData?.name || 'Student'}! 👋
          </h1>
          <p className="text-blue-100 drop-shadow">
            आज का Dashboard - {new Date().toLocaleDateString('hi-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid - iOS Premium Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STAT_CARDS.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              data-testid={`stat-card-${stat.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="group bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-700 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-4 rounded-2xl ${stat.bgColor} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${stat.textColor}`} />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Forms Trend (Last 30 Days)
          </h2>
        </div>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Chart visualization will be displayed here</p>
            <p className="text-sm">Track your application progress over time</p>
          </div>
        </div>
      </div>

      {/* Liked Forms */}
      {likedForms.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-600" />
            Your Liked Forms
          </h2>
          <div className="space-y-3">
            {likedForms.map((form: any) => (
              <div
                key={form.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {form.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {form.organization}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    form.status === 'live' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                      : form.status === 'upcoming'
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {form.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <AlertCircle className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Important Notice
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            नए forms की notification के लिए bell icon को enable करें
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <Calendar className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            Upcoming Deadlines
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
            {stats.live_forms} forms के deadlines नजदीक आ रहे हैं
          </p>
        </div>
      </div>
    </div>
  );
}
