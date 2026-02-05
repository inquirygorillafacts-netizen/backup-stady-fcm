'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Heart,
  ArrowLeft,
  Copy,
  Share2,
  Trash2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface LikedMessage {
  id: string;
  content: string;
  timestamp: Date;
  liked: boolean;
}

export default function LikedMessagesPage() {
  const router = useRouter();
  const [likedMessages, setLikedMessages] = useState<LikedMessage[]>([]);

  useEffect(() => {
    loadLikedMessages();
  }, []);

  const loadLikedMessages = () => {
    const stored = localStorage.getItem('likedAIMessages');
    if (stored) {
      setLikedMessages(JSON.parse(stored));
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const handleShare = (message: LikedMessage) => {
    const shareUrl = `${window.location.origin}/shared/${message.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied!');
  };

  const handleDelete = (messageId: string) => {
    const updated = likedMessages.filter(m => m.id !== messageId);
    setLikedMessages(updated);
    localStorage.setItem('likedAIMessages', JSON.stringify(updated));
    toast.success('Removed from liked');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Liked Messages</h1>
              <p className="text-gray-600 dark:text-gray-400">{likedMessages.length} saved responses</p>
            </div>
          </div>
        </div>

        {/* Liked Messages */}
        {likedMessages.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No liked messages yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Like AI responses to save them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {likedMessages.map((message) => (
              <div
                key={message.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 group hover:shadow-xl transition-all"
              >
                {/* Content */}
                <div className="mb-4">
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>

                {/* Metadata & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <Calendar className="w-4 h-4" />
                    {new Date(message.timestamp).toLocaleDateString('hi-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(message.content)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Copy"
                    >
                      <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleShare(message)}
                      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(message.id)}
                      className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
