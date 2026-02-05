'use client';

import Link from 'next/link';
import { Calendar, Users, ExternalLink, Clock, Briefcase, MapPin, Sparkles } from 'lucide-react';
import { formatDate, getDaysRemaining, cn } from '@/lib/utils';
import type { Job } from '@/types';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  const daysLeft = job.lastDate ? getDaysRemaining(job.lastDate) : null;
  
  const categoryColors: Record<string, { color: string }> = {
    Railway: { color: 'rgb(90, 200, 250)' },
    Banking: { color: 'rgb(52, 199, 89)' },
    SSC: { color: 'rgb(175, 82, 222)' },
    UPSC: { color: 'rgb(255, 149, 0)' },
    Defense: { color: 'rgb(255, 59, 48)' },
    Teaching: { color: 'rgb(255, 204, 0)' },
    Police: { color: 'rgb(255, 45, 85)' },
    default: { color: 'rgb(142, 142, 147)' },
  };

  const catColor = categoryColors[job.category || 'default'] || categoryColors.default;

  return (
    <Link href={`/jobs/${job.id}`}>
      <div className="group ios-card p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div 
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border/50"
            style={{ backgroundColor: `${catColor.color}15` }}
          >
            <Briefcase className="w-4 h-4" style={{ color: catColor.color }} />
            <span className="text-sm font-semibold" style={{ color: catColor.color }}>
              {job.category || 'General'}
            </span>
          </div>
          
          {daysLeft !== null && (
            <div 
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border border-border/50',
                daysLeft <= 5
                  ? 'text-red-600 dark:text-red-400'
                  : daysLeft <= 15
                  ? 'text-yellow-600 dark:text-yellow-400'
                  : 'text-green-600 dark:text-green-400'
              )}
              style={{
                backgroundColor: daysLeft <= 5 ? 'rgba(255, 59, 48, 0.1)' : 
                                 daysLeft <= 15 ? 'rgba(255, 204, 0, 0.1)' : 
                                 'rgba(52, 199, 89, 0.1)'
              }}
            >
              <Clock className="w-4 h-4" />
              {daysLeft > 0 ? `${daysLeft} दिन` : 'समाप्त'}
            </div>
          )}
        </div>

        {/* Title & Organization */}
        <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {job.title}
        </h3>
        <p className="text-muted-foreground mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {job.organization}
        </p>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {job.totalVacancies > 0 && (
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                <Users className="w-5 h-5" style={{ color: 'rgb(0, 122, 255)' }} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Vacancies</div>
                <div className="font-semibold text-lg">{job.totalVacancies}</div>
              </div>
            </div>
          )}
          
          {job.lastDate && (
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: 'rgba(175, 82, 222, 0.1)' }}>
                <Calendar className="w-5 h-5" style={{ color: 'rgb(175, 82, 222)' }} />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Last Date</div>
                <div className="font-semibold">{formatDate(job.lastDate)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Qualification */}
        {job.qualification && (
          <div className="mb-4 p-4 rounded-xl bg-muted/50 border border-border/50">
            <div className="text-xs text-muted-foreground mb-1 font-medium">Qualification</div>
            <div className="text-sm line-clamp-1">{job.qualification}</div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-border/50">
          <div className="flex-1 flex items-center gap-2 font-semibold group-hover:gap-3 transition-all" style={{ color: 'rgb(0, 122, 255)' }}>
            विवरण देखें
            <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          
          {job.aiConfidence && job.aiConfidence > 80 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border/50" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
              <Sparkles className="w-4 h-4" style={{ color: 'rgb(0, 122, 255)' }} />
              <span className="text-xs font-semibold" style={{ color: 'rgb(0, 122, 255)' }}>AI Verified</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
