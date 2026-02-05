'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Plus, 
  Lock, 
  Globe, 
  MessageCircle,
  Send,
  Phone,
  Clock,
  UserPlus,
  Settings,
  Heart,
  Search,
  Image as ImageIcon,
  FileText,
  X,
  PhoneCall,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Copy,
  Shield,
  Timer,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface Group {
  id: string;
  name: string;
  type: 'public' | 'private';
  owner_id: string;
  description?: string;
  members: string[];
  pending_requests: string[];
}

interface GroupMessage {
  id: string;
  group_id: string;
  user_id: string;
  user_name: string;
  message: string;
  message_type: 'text' | 'image' | 'pdf';
  timestamp: string;
}

export default function GroupsPage() {
  const { userData } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showRandomVoice, setShowRandomVoice] = useState(false);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [myCode, setMyCode] = useState('');
  const [callCode, setCallCode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInRandomCall, setIsInRandomCall] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchGroups();
    checkRandomVoiceTime();
    generateMyCode();
    
    // Check time every minute
    const interval = setInterval(checkRandomVoiceTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const generateMyCode = () => {
    const stored = localStorage.getItem('myAnonymousCode');
    if (stored) {
      setMyCode(stored);
    } else {
      const code = Math.floor(10000 + Math.random() * 90000).toString();
      localStorage.setItem('myAnonymousCode', code);
      setMyCode(code);
    }
  };

  const checkRandomVoiceTime = () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Show button at 5:00 PM (17:00) for 30 minutes
    if (hour === 17 && minute < 30) {
      setShowRandomVoice(true);
    } else {
      setShowRandomVoice(false);
    }
  };

  const fetchGroups = () => {
    const stored = localStorage.getItem('groups');
    if (stored) {
      setGroups(JSON.parse(stored));
    } else {
      setGroups(DUMMY_GROUPS);
      localStorage.setItem('groups', JSON.stringify(DUMMY_GROUPS));
    }
  };

  const fetchMessages = (groupId: string) => {
    const stored = localStorage.getItem(`messages_${groupId}`);
    if (stored) {
      const allMessages: GroupMessage[] = JSON.parse(stored);
      
      // Filter messages older than 3 days
      const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
      const recentMessages = allMessages.filter(msg => 
        new Date(msg.timestamp).getTime() > threeDaysAgo
      );
      
      // Save filtered messages back
      if (recentMessages.length !== allMessages.length) {
        localStorage.setItem(`messages_${groupId}`, JSON.stringify(recentMessages));
      }
      
      setMessages(recentMessages);
    } else {
      setMessages([]);
    }
  };

  const handleCreateGroup = (name: string, type: 'public' | 'private', description: string) => {
    const newGroup: Group = {
      id: Date.now().toString(),
      name,
      type,
      owner_id: userData?.id || '',
      description,
      members: [userData?.id || ''],
      pending_requests: []
    };

    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    localStorage.setItem('groups', JSON.stringify(updatedGroups));
    toast.success('Group created successfully!');
    setShowCreateGroup(false);
  };

  const handleJoinGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    if (group.type === 'public') {
      // Instantly join public groups
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, members: [...g.members, userData?.id || ''] }
          : g
      );
      setGroups(updatedGroups);
      localStorage.setItem('groups', JSON.stringify(updatedGroups));
      toast.success('Joined group successfully!');
    } else {
      // Send request for private groups
      const updatedGroups = groups.map(g => 
        g.id === groupId 
          ? { ...g, pending_requests: [...g.pending_requests, userData?.id || ''] }
          : g
      );
      setGroups(updatedGroups);
      localStorage.setItem('groups', JSON.stringify(updatedGroups));
      toast.success('Request sent to group owner');
    }
  };

  const handleSendMessage = (type: 'text' | 'image' | 'pdf' = 'text') => {
    if (type === 'text' && !messageInput.trim()) return;
    if (!selectedGroup) return;

    const newMessage: GroupMessage = {
      id: Date.now().toString(),
      group_id: selectedGroup.id,
      user_id: userData?.id || '',
      user_name: userData?.name || 'User',
      message: type === 'text' ? messageInput : `[${type.toUpperCase()}]`,
      message_type: type,
      timestamp: new Date().toISOString()
    };

    const groupMessages = [...messages, newMessage];
    setMessages(groupMessages);
    localStorage.setItem(`messages_${selectedGroup.id}`, JSON.stringify(groupMessages));
    setMessageInput('');

    if (type !== 'text') {
      toast.info(`${type} upload will be available after Firebase Storage integration`);
    }
  };

  const handleRandomVoiceConnect = () => {
    setIsInRandomCall(true);
    setShowVoiceCall(true);
    toast.success('Connecting to random user... 🎤');
    
    // Simulate finding a match after 5 seconds
    setTimeout(() => {
      const found = Math.random() > 0.3; // 70% chance of finding someone
      if (found) {
        toast.success('Connected! You can now talk anonymously.');
      } else {
        toast.error('अभी कोई उपलब्ध नहीं है। Please try again later.');
        setShowVoiceCall(false);
        setIsInRandomCall(false);
      }
    }, 5000);
  };

  const handleCodeCall = () => {
    if (callCode.length !== 5) {
      toast.error('Please enter a valid 5-digit code');
      return;
    }

    // Simulate checking if user is online
    const isOnline = Math.random() > 0.5;
    if (isOnline) {
      setShowVoiceCall(true);
      setShowCodeModal(false);
      toast.success(`Calling ${callCode}... 📞`);
    } else {
      toast.error('User is offline. Try again later.');
    }
  };

  const handleEndCall = () => {
    setShowVoiceCall(false);
    setIsInRandomCall(false);
    toast.info('Call ended');
  };

  const handleClearHistory = (groupId: string) => {
    localStorage.removeItem(`messages_${groupId}`);
    if (selectedGroup?.id === groupId) {
      setMessages([]);
    }
    toast.success('Chat history cleared');
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Voice Call Modal
  if (showVoiceCall) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 p-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-md w-full space-y-8 text-center">
          <div className="space-y-4">
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <Shield className="w-16 h-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {isInRandomCall ? 'Anonymous Call' : `Calling ${callCode}`}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {isInRandomCall ? 'You are connected anonymously' : 'Voice call in progress'}
            </p>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock className="w-4 h-4" />
              <span>00:00</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-6 rounded-full transition-all shadow-lg ${
                isMuted 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {isMuted ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
            <button
              onClick={handleEndCall}
              className="p-6 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-lg"
            >
              <PhoneOff className="w-8 h-8" />
            </button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            🔒 This call is completely anonymous. No data is shared.
          </p>
        </div>
      </div>
    );
  }

  // Group Chat View
  if (selectedGroup) {
    return (
      <div className="h-screen flex flex-col">
        {/* Chat Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedGroup(null)}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedGroup.name}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedGroup.members.length} members • {selectedGroup.type}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleClearHistory(selectedGroup.id)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Clear History"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          {/* Auto-delete notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3">
            <Timer className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Messages older than 3 days are automatically deleted
            </p>
          </div>

          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMyMessage = msg.user_id === userData?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    isMyMessage ? 'justify-end' : 'justify-start'
                  } animate-fade-in`}
                >
                  {!isMyMessage && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-sm font-bold">
                        {msg.user_name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`max-w-xs p-3 rounded-2xl shadow-lg ${
                      isMyMessage
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {!isMyMessage && (
                      <p className="text-xs font-semibold mb-1 opacity-70">{msg.user_name}</p>
                    )}
                    <p>{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.timestamp).toLocaleTimeString('hi-IN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  {isMyMessage && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <span className="text-white text-sm font-bold">
                        {userData?.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <button 
              onClick={() => handleSendMessage('image')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Send Image"
            >
              <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button 
              onClick={() => handleSendMessage('pdf')}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Send PDF"
            >
              <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage('text')}
              placeholder="Type a message..."
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 border-none"
            />
            <button
              onClick={() => handleSendMessage('text')}
              className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Groups List View
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Groups & Chat</h1>
          <p className="text-gray-600 dark:text-gray-400">Connect with other students</p>
        </div>
        <button
          onClick={() => setShowCreateGroup(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Create Group
        </button>
      </div>

      {/* Random Voice Connection (5 PM Feature) */}
      {showRandomVoice && (
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl p-6 text-white shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center animate-pulse">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-1">Random Voice Connection 🎤</h3>
                <p className="text-purple-100">Connect with a random student anonymously</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Available for next 30 minutes</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleRandomVoiceConnect}
              className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-purple-50 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              Connect Now
            </button>
          </div>
        </div>
      )}

      {/* My Anonymous Code */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Your Anonymous Code</h3>
            <p className="text-blue-100 text-sm mb-3">Share this code with friends for private calls</p>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-lg px-6 py-3 rounded-xl">
                <p className="text-3xl font-bold tracking-wider">{myCode}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(myCode);
                  toast.success('Code copied!');
                }}
                className="p-3 bg-white/20 backdrop-blur-lg rounded-xl hover:bg-white/30 transition-colors"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowCodeModal(true)}
            className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
          >
            <PhoneCall className="w-5 h-5 inline mr-2" />
            Call by Code
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => {
          const isMember = group.members.includes(userData?.id || '');
          const hasPendingRequest = group.pending_requests.includes(userData?.id || '');

          return (
            <div
              key={group.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-2xl transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">{group.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {group.type === 'public' ? (
                        <Globe className="w-4 h-4 text-green-500" />
                      ) : (
                        <Lock className="w-4 h-4 text-orange-500" />
                      )}
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {group.type}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {group.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {group.members.length} members
                </span>
                {isMember ? (
                  <button
                    onClick={() => setSelectedGroup(group)}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 shadow-lg"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Open
                  </button>
                ) : hasPendingRequest ? (
                  <button
                    disabled
                    className="bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg font-medium cursor-not-allowed"
                  >
                    Pending
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoinGroup(group.id)}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 shadow-lg"
                  >
                    <UserPlus className="w-4 h-4" />
                    Join
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onCreate={handleCreateGroup}
        />
      )}

      {/* Code Call Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Call by Code</h2>
              <button onClick={() => setShowCodeModal(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your friend's 5-digit anonymous code
            </p>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={callCode}
              onChange={(e) => setCallCode(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 5-digit code"
              className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest font-bold"
            />
            <button
              onClick={handleCodeCall}
              disabled={callCode.length !== 5}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              <PhoneCall className="w-5 h-5" />
              Call Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Create Group Modal Component
function CreateGroupModal({ 
  onClose, 
  onCreate 
}: { 
  onClose: () => void; 
  onCreate: (name: string, type: 'public' | 'private', description: string) => void;
}) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'public' | 'private'>('public');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error('Please enter group name');
      return;
    }
    onCreate(name, type, description);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Group</h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter group name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Type
          </label>
          <div className="flex gap-4">
            <button
              onClick={() => setType('public')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                type === 'public'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium">Public</span>
            </button>
            <button
              onClick={() => setType('private')}
              className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                type === 'private'
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 dark:border-gray-600'
              }`}
            >
              <Lock className="w-5 h-5" />
              <span className="font-medium">Private</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl border-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="What is this group about?"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 shadow-lg"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// Dummy Data
const DUMMY_GROUPS: Group[] = [
  {
    id: 'default-public',
    name: 'Stady Community (Official)',
    type: 'public',
    owner_id: 'admin',
    description: 'Official public group for all Stady users. Join and connect!',
    members: ['user1', 'user2', 'user3'],
    pending_requests: []
  },
  {
    id: '2',
    name: 'SSC CGL Preparation 2024',
    type: 'public',
    owner_id: 'owner1',
    description: 'Discussion group for SSC CGL exam preparation',
    members: ['user1', 'user2', 'user3'],
    pending_requests: []
  },
  {
    id: '3',
    name: 'UPSC Aspirants',
    type: 'public',
    owner_id: 'owner2',
    description: 'Connect with fellow UPSC aspirants',
    members: ['user1', 'user4'],
    pending_requests: []
  },
];
