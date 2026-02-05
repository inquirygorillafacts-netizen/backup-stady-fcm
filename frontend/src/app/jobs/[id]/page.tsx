'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Users, DollarSign, GraduationCap, Clock, ExternalLink } from 'lucide-react';
import { formatDate, getDaysRemaining } from '@/lib/utils';
import type { Job } from '@/types';
import FormFillingService from '@/components/jobs/FormFillingService';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchJob(params.id as string);
    }
  }, [params.id]);

  const fetchJob = async (id: string) => {
    try {
      const response = await fetch(`/api/jobs/${id}`);
      const data = await response.json();
      setJob(data);
    } catch (error) {
      console.error('Error fetching job:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Job not found</h2>
          <Link href="/jobs">
            <Button>Back to Jobs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysLeft = job.lastDate ? getDaysRemaining(job.lastDate) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/jobs">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Jobs
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <Badge variant="info">{job.category}</Badge>
              {daysLeft !== null && (
                <Badge 
                  variant={daysLeft <= 5 ? 'error' : daysLeft <= 15 ? 'warning' : 'success'}
                  className="text-base px-4 py-2"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  {daysLeft > 0 ? `${daysLeft} दिन बाकी` : 'समाप्त'}
                </Badge>
              )}
            </div>
            <CardTitle className="text-3xl mb-2">{job.title}</CardTitle>
            <p className="text-xl text-gray-600">{job.organization}</p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Key Info Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {job.postName && (
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                  <GraduationCap className="h-6 w-6 text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Post Name</p>
                    <p className="font-semibold">{job.postName}</p>
                  </div>
                </div>
              )}

              {job.totalVacancies > 0 && (
                <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                  <Users className="h-6 w-6 text-green-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Total Vacancies</p>
                    <p className="font-semibold">{job.totalVacancies}</p>
                  </div>
                </div>
              )}

              {job.lastDate && (
                <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-orange-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Last Date</p>
                    <p className="font-semibold">{formatDate(job.lastDate)}</p>
                  </div>
                </div>
              )}

              {job.applicationFee && (
                <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Application Fee</p>
                    <p className="font-semibold">{job.applicationFee}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4">
              {job.qualification && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">🎓 Qualification</h3>
                  <p className="text-gray-700">{job.qualification}</p>
                </div>
              )}

              {job.ageLimit && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">🎂 Age Limit</h3>
                  <p className="text-gray-700">{job.ageLimit}</p>
                </div>
              )}

              {job.startDate && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">📅 Start Date</h3>
                  <p className="text-gray-700">{formatDate(job.startDate)}</p>
                </div>
              )}

              {job.examDate && (
                <div>
                  <h3 className="font-semibold text-lg mb-2">📝 Exam Date</h3>
                  <p className="text-gray-700">{formatDate(job.examDate)}</p>
                </div>
              )}
            </div>

            {/* Form Filling Service */}
            <div className="my-6">
              <FormFillingService 
                jobId={job.id}
                jobTitle={job.title}
                category={job.category}
              />
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4">
              {job.officialLink && (
                <a 
                  href={job.officialLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="primary" size="lg" className="w-full">
                    <ExternalLink className="h-5 w-5 mr-2" />
                    Official Notification
                  </Button>
                </a>
              )}
            </div>

            {/* Source Info */}
            <div className="text-sm text-gray-500 pt-4 border-t">
              <p>Source: {job.source}</p>
              {job.aiConfidence && (
                <p>AI Confidence: {job.aiConfidence}%</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
