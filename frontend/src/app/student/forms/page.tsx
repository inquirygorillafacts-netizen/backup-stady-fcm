'use client';

import { useEffect, useState } from 'react';
import { 
  Clock, 
  Calendar, 
  ExternalLink,
  Heart,
  Filter,
  Search,
  MapPin,
  GraduationCap,
  Users
} from 'lucide-react';
import { formsAPI, likesAPI } from '@/lib/api';
import { toast } from 'sonner';

interface JobForm {
  id: string;
  title: string;
  organization: string;
  category: string;
  state?: string;
  qualification?: string;
  start_date: string;
  end_date: string;
  status: 'live' | 'upcoming' | 'closed';
  description?: string;
  link?: string;
  total_posts?: number;
  application_fee?: string;
}

export default function FormsPage() {
  const [forms, setForms] = useState<JobForm[]>([]);
  const [filteredForms, setFilteredForms] = useState<JobForm[]>([]);
  const [likedFormIds, setLikedFormIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'live' | 'upcoming' | 'closed'>('live');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchForms();
    fetchLikedForms();
  }, []);

  useEffect(() => {
    filterForms();
  }, [forms, selectedFilter, searchQuery]);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await formsAPI.getForms();
      setForms(response.data || []);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to load forms');
      // Set dummy data for UI
      setForms(DUMMY_FORMS);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikedForms = async () => {
    try {
      const response = await likesAPI.getMyLikes();
      const liked = response.data || [];
      setLikedFormIds(new Set(liked.map((f: any) => f.id)));
    } catch (error) {
      console.error('Error fetching liked forms:', error);
    }
  };

  const filterForms = () => {
    let filtered = forms;

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(f => f.status === selectedFilter);
    }

    // Search
    if (searchQuery) {
      filtered = filtered.filter(f => 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredForms(filtered);
  };

  const handleLike = async (formId: string) => {
    try {
      await likesAPI.likeForm(formId);
      setLikedFormIds(prev => {
        const newSet = new Set(prev);
        if (newSet.has(formId)) {
          newSet.delete(formId);
        } else {
          newSet.add(formId);
        }
        return newSet;
      });
    } catch (error) {
      console.error('Error liking form:', error);
      toast.error('Failed to update like');
    }
  };

  const getTimeRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return { days: 0, hours: 0, expired: true };
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours, expired: false };
  };

  const getTimerColor = (endDate: string) => {
    const { days, expired } = getTimeRemaining(endDate);
    
    if (expired) return 'bg-gray-400';
    if (days <= 2) return 'bg-red-500'; // Red when 2 days left
    if (days <= 5) return 'bg-yellow-500'; // Yellow when 5 days left
    if (days <= 15) return 'bg-blue-500'; // Blue when some days passed
    return 'bg-green-500'; // Green when newly opened
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          सरकारी नौकरी Forms
        </h1>

        {/* Search & Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {['all', 'live', 'upcoming', 'closed'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter as any)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <div className="text-center py-12">
          <Filter className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-xl text-gray-600 dark:text-gray-400">No forms found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredForms.map((form) => {
            const timeRemaining = getTimeRemaining(form.end_date);
            const timerColor = getTimerColor(form.end_date);
            const isLiked = likedFormIds.has(form.id);

            return (
              <div
                key={form.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
              >
                {/* Timer Bar */}
                <div className={`h-2 ${timerColor} transition-colors duration-500`}>
                  <div className="h-full bg-gradient-to-r from-transparent to-white/20 animate-pulse"></div>
                </div>

                <div className="p-6 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {form.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {form.organization}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLike(form.id)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Heart
                        className={`w-6 h-6 ${
                          isLiked
                            ? 'fill-red-500 text-red-500'
                            : 'text-gray-400'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <GraduationCap className="w-4 h-4" />
                      <span>{form.category}</span>
                    </div>
                    {form.state && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4" />
                        <span>{form.state}</span>
                      </div>
                    )}
                    {form.total_posts && (
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{form.total_posts} Posts</span>
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(form.start_date).toLocaleDateString('hi-IN')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {new Date(form.end_date).toLocaleDateString('hi-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Timer Display */}
                  <div className={`p-4 rounded-lg ${
                    timeRemaining.expired
                      ? 'bg-gray-100 dark:bg-gray-700'
                      : timeRemaining.days <= 2
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : timeRemaining.days <= 5
                      ? 'bg-yellow-50 dark:bg-yellow-900/20'
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  }`}>
                    <div className="text-center">
                      {timeRemaining.expired ? (
                        <p className="text-gray-600 dark:text-gray-400 font-semibold">
                          Form Closed
                        </p>
                      ) : (
                        <>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {timeRemaining.days} Days {timeRemaining.hours} Hours
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Time Remaining
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  {form.link && (
                    <a
                      href={form.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Dummy Data for UI Testing
const DUMMY_FORMS: JobForm[] = [
  {
    id: '1',
    title: 'SSC CGL 2024',
    organization: 'Staff Selection Commission',
    category: 'Central Government',
    state: 'All India',
    qualification: 'Graduate',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'live',
    total_posts: 15000,
    application_fee: '₹100',
    link: 'https://ssc.nic.in'
  },
  {
    id: '2',
    title: 'UPSC Civil Services 2024',
    organization: 'Union Public Service Commission',
    category: 'Central Government',
    state: 'All India',
    qualification: 'Graduate',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'live',
    total_posts: 1000,
    application_fee: '₹100',
    link: 'https://upsc.gov.in'
  },
  {
    id: '3',
    title: 'Railway Group D',
    organization: 'Indian Railways',
    category: 'Central Government',
    state: 'All India',
    qualification: '10th Pass',
    start_date: new Date().toISOString(),
    end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'live',
    total_posts: 50000,
    application_fee: '₹250',
    link: 'https://rrbcdg.gov.in'
  },
];
