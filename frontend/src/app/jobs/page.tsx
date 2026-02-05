'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import JobCard from '@/components/jobs/JobCard';
import { Search, Filter, Bell, Sparkles, TrendingUp, X } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { Job } from '@/types';
import { cn } from '@/lib/utils';

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchJobs();
  }, [category]);

  const fetchJobs = async () => {
    try {
      const url = category
        ? `/api/jobs?category=${category}&limit=50`
        : '/api/jobs?limit=50';

      const response = await fetch(url);
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { name: 'All', value: '', color: 'rgb(0, 122, 255)' },
    { name: 'Railway', value: 'Railway', color: 'rgb(90, 200, 250)' },
    { name: 'Banking', value: 'Banking', color: 'rgb(52, 199, 89)' },
    { name: 'SSC', value: 'SSC', color: 'rgb(175, 82, 222)' },
    { name: 'UPSC', value: 'UPSC', color: 'rgb(255, 149, 0)' },
    { name: 'Defense', value: 'Defense', color: 'rgb(255, 59, 48)' },
    { name: 'Teaching', value: 'Teaching', color: 'rgb(255, 204, 0)' },
    { name: 'Police', value: 'Police', color: 'rgb(255, 45, 85)' },
    { name: 'PSC', value: 'State PSC', color: 'rgb(0, 122, 255)' },
  ];

  const filteredJobs = jobs.filter((job) =>
    job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.organization?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Premium iOS Header */}
      <header className="sticky top-0 z-40 glass border-b border-border/50 animate-fade-in safe-area-top">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="relative gradient-accent p-2.5 rounded-2xl shadow-sm">
                  <Bell className="h-5 w-5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-semibold">सभी Jobs</h1>
                <p className="text-xs text-muted-foreground">{filteredJobs.length} opportunities</p>
              </div>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* iOS Search Bar */}
      <div className="sticky top-16 z-30 glass border-b border-border/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder="Job या Organization सर्च करें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-border/50 bg-background/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* iOS Category Pills */}
      <div className="sticky top-32 z-20 glass border-b border-border/50 py-4 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-1">
            <Filter className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full whitespace-nowrap font-medium text-sm',
                  'transition-all duration-200 flex-shrink-0 border',
                  category === cat.value
                    ? 'shadow-sm border-transparent text-white'
                    : 'glass border-border/50 hover:border-border'
                )}
                style={category === cat.value ? { background: cat.color } : {}}
              >
                <span>{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
              <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="mt-4 text-muted-foreground">Jobs लोड हो रही हैं...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="ios-card p-12 text-center max-w-md">
              <div className="inline-flex p-4 bg-muted rounded-2xl mb-4">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">कोई Job नहीं मिली</h3>
              <p className="text-muted-foreground">Try different search or category</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 max-w-4xl mx-auto">
            {filteredJobs.map((job, index) => (
              <div
                key={job.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <JobCard job={job} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
