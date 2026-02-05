'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Send, 
  Image as ImageIcon,
  Camera,
  Plus,
  Mic,
  MicOff,
  Sparkles,
  ChevronDown,
  ChevronUp,
  History,
  Bot,
  User as UserIcon,
  Trash2,
  Copy,
  RotateCw,
  Zap,
  Brain,
  Edit,
  X,
  Check,
  Heart,
  MoreVertical,
  Volume2,
  CircleDot,
  Folder,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { getFirebaseDatabase } from '@/lib/firebase';
import { ref, set, get, update } from 'firebase/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  liked?: boolean;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
}

interface CustomAIModel {
  id: string;
  name: string;
  purpose: string;
  instructions: string;
  sources: string[];
  created_at: string;
}

interface UserBiography {
  name: string;
  work: string;
  likes: string[];
  dislikes: string[];
  goals: string[];
  dreams: string[];
  relationships: { [key: string]: string };
  habits: string[];
  lastUpdated: string;
}

type AIMode = 'chat' | 'image-gen' | 'deep-research' | 'pdf-gen';

export default function AIPage() {
  const { userData } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomModels, setShowCustomModels] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [showFileOptions, setShowFileOptions] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AIMode>('chat');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [customModels, setCustomModels] = useState<CustomAIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [userBiography, setUserBiography] = useState<UserBiography | null>(null);
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChats();
    loadCustomModels();
    loadUserBiography();
  }, [userData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadUserBiography = async () => {
    if (!userData?.id) return;
    
    try {
      const db = getFirebaseDatabase();
      const bioRef = ref(db, `users/${userData.id}/biography`);
      const snapshot = await get(bioRef);
      
      if (snapshot.exists()) {
        setUserBiography(snapshot.val());
      } else {
        // Create initial biography
        const initialBio: UserBiography = {
          name: userData.name || '',
          work: '',
          likes: [],
          dislikes: [],
          goals: [],
          dreams: [],
          relationships: {},
          habits: [],
          lastUpdated: new Date().toISOString()
        };
        await set(bioRef, initialBio);
        setUserBiography(initialBio);
      }
    } catch (error) {
      console.error('Error loading biography:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem('userBiography');
      if (stored) {
        setUserBiography(JSON.parse(stored));
      }
    }
  };

  const updateUserBiography = async (updates: Partial<UserBiography>) => {
    if (!userData?.id) return;

    const updatedBio = {
      ...userBiography,
      ...updates,
      lastUpdated: new Date().toISOString()
    } as UserBiography;

    try {
      const db = getFirebaseDatabase();
      const bioRef = ref(db, `users/${userData.id}/biography`);
      await update(bioRef, updatedBio);
      setUserBiography(updatedBio);
    } catch (error) {
      console.error('Error updating biography:', error);
      // Fallback to localStorage
      localStorage.setItem('userBiography', JSON.stringify(updatedBio));
      setUserBiography(updatedBio);
    }
  };

  const fetchChats = () => {
    const stored = localStorage.getItem('aiChats');
    if (stored) {
      setChats(JSON.parse(stored));
    }
  };

  const loadCustomModels = () => {
    const stored = localStorage.getItem('customAIModels');
    if (stored) {
      setCustomModels(JSON.parse(stored));
    }
  };

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      created_at: new Date().toISOString()
    };
    const updatedChats = [newChat, ...chats];
    setChats(updatedChats);
    setCurrentChat(newChat);
    setMessages([]);
    localStorage.setItem('aiChats', JSON.stringify(updatedChats));
  };

  const handleRenameChat = (chatId: string, newTitle: string) => {
    const updatedChats = chats.map(c => 
      c.id === chatId ? { ...c, title: newTitle } : c
    );
    setChats(updatedChats);
    localStorage.setItem('aiChats', JSON.stringify(updatedChats));
    setEditingChatId(null);
    toast.success('Chat renamed');
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    localStorage.setItem('aiChats', JSON.stringify(updatedChats));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
    toast.success('Chat deleted');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!currentChat) {
      createNewChat();
      setTimeout(() => handleSend(), 100);
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    // Extract biography information from conversation
    extractBiographyInfo(input);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getDemoResponse(selectedMode),
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Auto-generate title for first message
      if (finalMessages.length === 2) {
        const title = input.slice(0, 50) + (input.length > 50 ? '...' : '');
        const updatedChat = { ...currentChat, title, messages: finalMessages };
        setCurrentChat(updatedChat);
        const updatedChats = chats.map(c => c.id === currentChat.id ? updatedChat : c);
        setChats(updatedChats);
        localStorage.setItem('aiChats', JSON.stringify(updatedChats));
      } else {
        // Update chat
        const updatedChat = { ...currentChat, messages: finalMessages };
        setCurrentChat(updatedChat);
        const updatedChats = chats.map(c => c.id === currentChat.id ? updatedChat : c);
        setChats(updatedChats);
        localStorage.setItem('aiChats', JSON.stringify(updatedChats));
      }
      
      setLoading(false);
    }, 1500);
  };

  const extractBiographyInfo = (message: string) => {
    // Simple NLP-like extraction (in production, use proper AI)
    const lowerMsg = message.toLowerCase();
    
    // Extract name
    if (lowerMsg.includes('my name is') || lowerMsg.includes('मेरा नाम')) {
      const nameMatch = message.match(/(?:my name is|मेरा नाम) (\w+)/i);
      if (nameMatch) {
        updateUserBiography({ name: nameMatch[1] });
      }
    }

    // Extract work/occupation
    if (lowerMsg.includes('i work') || lowerMsg.includes('मैं काम')) {
      const workMatch = message.match(/(?:i work as|मैं काम करता हूं) (.+)/i);
      if (workMatch) {
        updateUserBiography({ work: workMatch[1] });
      }
    }

    // Extract likes
    if (lowerMsg.includes('i like') || lowerMsg.includes('मुझे पसंद')) {
      const likes = userBiography?.likes || [];
      const newLike = message.match(/(?:i like|मुझे पसंद) (.+)/i)?.[1];
      if (newLike && !likes.includes(newLike)) {
        updateUserBiography({ likes: [...likes, newLike] });
      }
    }

    // Extract goals
    if (lowerMsg.includes('my goal') || lowerMsg.includes('मेरा लक्ष्य')) {
      const goals = userBiography?.goals || [];
      const newGoal = message.match(/(?:my goal|मेरा लक्ष्य) (.+)/i)?.[1];
      if (newGoal && !goals.includes(newGoal)) {
        updateUserBiography({ goals: [...goals, newGoal] });
      }
    }
  };

  const getDemoResponse = (mode: AIMode) => {
    const userName = userBiography?.name || userData?.name || 'there';
    
    switch (mode) {
      case 'image-gen':
        return `Hi ${userName}! 🎨 I'll generate an image based on your description. This feature will be fully functional after Google Gemini Nano Banana integration.`;
      case 'deep-research':
        return `${userName}, मैं आपके topic पर deep research कर रहा हूं... 🔍 Multiple sources से data collect कर रहा हूं। This will provide comprehensive analysis once integrated.`;
      case 'pdf-gen':
        return `${userName}, मैं आपके लिए PDF document generate कर रहा हूं... 📄 This will be available after full integration.`;
      default:
        let response = `Hello ${userName}! 👋`;
        
        if (userBiography?.goals && userBiography.goals.length > 0) {
          response += `\n\nI remember your goals: ${userBiography.goals.join(', ')}. Let me help you with that!`;
        }
        
        response += `\n\nThis is a demo response. After Firebase and Google AI integration, I'll remember our entire conversation history and provide personalized responses based on what I know about you.`;
        
        return response;
    }
  };

  const handleLikeMessage = (messageId: string) => {
    const updatedMessages = messages.map(msg =>
      msg.id === messageId ? { ...msg, liked: !msg.liked } : msg
    );
    setMessages(updatedMessages);

    // Save liked messages
    const likedMessages = updatedMessages.filter(m => m.liked && m.role === 'assistant');
    localStorage.setItem('likedAIMessages', JSON.stringify(likedMessages));

    // Update chat
    if (currentChat) {
      const updatedChat = { ...currentChat, messages: updatedMessages };
      const updatedChats = chats.map(c => c.id === currentChat.id ? updatedChat : c);
      setChats(updatedChats);
      localStorage.setItem('aiChats', JSON.stringify(updatedChats));
    }

    toast.success(updatedMessages.find(m => m.id === messageId)?.liked ? 'Added to liked' : 'Removed from liked');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied!');
  };

  const handleRegenerate = async () => {
    if (messages.length === 0) return;
    
    // Remove last AI message and regenerate
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) return;

    const messagesWithoutLastAI = messages.slice(0, -1);
    setMessages(messagesWithoutLastAI);
    setLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getDemoResponse(selectedMode) + '\n\n(Regenerated)',
        timestamp: new Date()
      };
      const finalMessages = [...messagesWithoutLastAI, aiMessage];
      setMessages(finalMessages);
      setLoading(false);
    }, 1500);
  };

  const handleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      toast.info('Voice mode activated 🎤');
    } else {
      toast.info('Back to text mode');
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('Recording started... (Feature pending integration)');
    } else {
      toast.info('Recording stopped');
    }
  };

  const handleFileUpload = (type: 'camera' | 'gallery') => {
    toast.info(`${type === 'camera' ? 'Camera' : 'Gallery'} feature will be available after Firebase Storage integration`);
    setShowFileOptions(false);
  };

  const AI_MODES = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'image-gen', label: 'Image Gen', icon: ImageIcon },
    { id: 'deep-research', label: 'Deep Research', icon: Zap },
    { id: 'pdf-gen', label: 'PDF Gen', icon: FileText },
  ];

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Modern Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                {selectedModel 
                  ? customModels.find(m => m.id === selectedModel)?.name 
                  : 'AI Assistant'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomModels(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Custom Models"
            >
              <Workflow className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 py-12">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Bot className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Hi {userData?.name || 'there'}! 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    How can I help you today?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {[
                    { icon: Sparkles, text: 'Generate ideas', color: 'from-yellow-400 to-orange-500' },
                    { icon: Brain, text: 'Deep research', color: 'from-blue-500 to-cyan-500' },
                    { icon: ImageIcon, text: 'Create images', color: 'from-pink-500 to-purple-500' },
                    { icon: Zap, text: 'Quick answers', color: 'from-green-500 to-emerald-500' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(item.text)}
                      className={`p-4 bg-gradient-to-br ${item.color} text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all`}
                    >
                      <item.icon className="w-6 h-6 mb-2" />
                      <p className="text-sm font-medium">{item.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  } group`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[85%]">
                    <div
                      className={`px-4 py-3 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    </div>
                    
                    {/* Message Actions */}
                    <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <button
                        onClick={() => handleCopy(message.content)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title="Copy"
                      >
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      {message.role === 'assistant' && (
                        <>
                          <button
                            onClick={() => handleLikeMessage(message.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Like"
                          >
                            <Heart className={`w-4 h-4 ${
                              message.liked 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </button>
                          {index === messages.length - 1 && (
                            <button
                              onClick={handleRegenerate}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              title="Regenerate"
                            >
                              <RotateCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                        </>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        {new Date(message.timestamp).toLocaleTimeString('hi-IN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-2xl">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Modern Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            {/* Main Input Container */}
            <div className="flex-1 relative">
              {/* Mode Dropdown Button */}
              <button
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {React.createElement(AI_MODES.find(m => m.id === selectedMode)?.icon || Sparkles, {
                  className: "w-5 h-5 text-gray-600 dark:text-gray-400"
                })}
              </button>

              {/* Mode Dropdown */}
              {showModeDropdown && (
                <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-[200px] z-20">
                  {AI_MODES.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setSelectedMode(mode.id as AIMode);
                          setShowModeDropdown(false);
                          toast.success(`${mode.label} mode selected`);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                          selectedMode === mode.id
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{mode.label}</span>
                        {selectedMode === mode.id && <Check className="w-4 h-4 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* File Upload Button */}
              <button
                onClick={() => setShowFileOptions(!showFileOptions)}
                className="absolute left-12 top-1/2 -translate-y-1/2 z-10 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {/* File Options Dropdown */}
              {showFileOptions && (
                <div className="absolute bottom-full left-12 mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-[180px] z-20">
                  <button
                    onClick={() => handleFileUpload('camera')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <Camera className="w-5 h-5" />
                    <span className="font-medium">Take Photo</span>
                  </button>
                  <button
                    onClick={() => handleFileUpload('gallery')}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="font-medium">Choose from Gallery</span>
                  </button>
                </div>
              )}

              {/* Input Field */}
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={
                  selectedMode === 'image-gen' 
                    ? 'Describe the image...'
                    : selectedMode === 'deep-research'
                    ? 'What to research?'
                    : 'Message AI...'
                }
                className="w-full pl-24 pr-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-full border-none focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-900 dark:text-white"
              />
            </div>

            {/* Voice Mode Button */}
            <button
              onClick={handleVoiceMode}
              className={`p-3 rounded-full transition-all shadow-lg ${
                isVoiceMode
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Voice Mode"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Mode Slide */}
      {isVoiceMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
          <div className="w-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 rounded-t-3xl p-8 animate-slide-up">
            <button
              onClick={handleVoiceMode}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="text-center space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                {/* Animated Voice Circles */}
                <div className={`absolute inset-0 rounded-full bg-white/20 ${isRecording ? 'animate-ping' : ''}`} />
                <div className={`absolute inset-4 rounded-full bg-white/30 ${isRecording ? 'animate-pulse' : ''}`} />
                <div className="absolute inset-8 rounded-full bg-white flex items-center justify-center">
                  {isRecording ? (
                    <Volume2 className="w-12 h-12 text-purple-600 animate-pulse" />
                  ) : (
                    <Mic className="w-12 h-12 text-purple-600" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  {isRecording ? 'Listening...' : 'Voice Mode'}
                </h3>
                <p className="text-white/80">
                  {isRecording ? 'Speak now. I\'m listening.' : 'Tap to start voice conversation'}
                </p>
              </div>

              <button
                onClick={handleToggleRecording}
                className={`px-8 py-4 rounded-full font-semibold transition-all shadow-xl ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white text-purple-600 hover:bg-gray-100'
                }`}
              >
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </span>
                )}
              </button>

              <p className="text-xs text-white/60">
                Voice-to-voice feature will be available after Google Gemini Live API integration
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History Bottom Sheet */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setShowHistory(false)}>
          <div
            className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[80vh] overflow-y-auto animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <History className="w-6 h-6" />
                  Chat History
                </h2>
                <button
                  onClick={() => {
                    createNewChat();
                    setShowHistory(false);
                  }}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  New Chat
                </button>
              </div>

              {chats.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No chats yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="group relative bg-gray-50 dark:bg-gray-800 rounded-xl p-4 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          onClick={() => {
                            setCurrentChat(chat);
                            setMessages(chat.messages || []);
                            setShowHistory(false);
                          }}
                          className="flex-1 text-left"
                        >
                          {editingChatId === chat.id ? (
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onBlur={() => handleRenameChat(chat.id, editingTitle)}
                              onKeyPress={(e) => e.key === 'Enter' && handleRenameChat(chat.id, editingTitle)}
                              className="w-full px-2 py-1 bg-white dark:bg-gray-900 rounded border border-blue-500 focus:outline-none"
                              autoFocus
                            />
                          ) : (
                            <>
                              <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">
                                {chat.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {new Date(chat.created_at).toLocaleDateString('hi-IN')}
                                <span>•</span>
                                <span>{chat.messages?.length || 0} messages</span>
                              </div>
                            </>
                          )}
                        </button>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setEditingChatId(chat.id);
                              setEditingTitle(chat.title);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                            title="Rename"
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteChat(chat.id)}
                            className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
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
        </div>
      )}

      {/* Custom Models Modal */}
      {showCustomModels && (
        <CustomModelsPanel
          models={customModels}
          setModels={setCustomModels}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          onClose={() => setShowCustomModels(false)}
        />
      )}
    </div>
  );
}

// Custom Models Panel Component (same as before but with updated styling)
function CustomModelsPanel({ models, setModels, selectedModel, setSelectedModel, onClose }: any) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    purpose: '',
    instructions: '',
    sources: ''
  });

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter model name');
      return;
    }

    if (models.length >= 3) {
      toast.error('Maximum 3 custom models allowed');
      return;
    }

    const newModel: CustomAIModel = {
      id: Date.now().toString(),
      name: formData.name,
      purpose: formData.purpose,
      instructions: formData.instructions,
      sources: formData.sources.split(',').map(s => s.trim()).filter(Boolean),
      created_at: new Date().toISOString()
    };

    const updatedModels = [...models, newModel];
    setModels(updatedModels);
    localStorage.setItem('customAIModels', JSON.stringify(updatedModels));
    toast.success('Custom AI model created!');
    setShowCreateForm(false);
    setFormData({ name: '', purpose: '', instructions: '', sources: '' });
  };

  const handleDelete = (id: string) => {
    const updatedModels = models.filter((m: CustomAIModel) => m.id !== id);
    setModels(updatedModels);
    localStorage.setItem('customAIModels', JSON.stringify(updatedModels));
    if (selectedModel === id) {
      setSelectedModel(null);
    }
    toast.success('Model deleted');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom AI Models</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Create up to 3 custom AI models for specific purposes
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Default Model */}
          <div 
            onClick={() => setSelectedModel(null)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              selectedModel === null
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Default AI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">General purpose AI assistant</p>
              </div>
              {selectedModel === null && (
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>

          {/* Custom Models */}
          {models.map((model: CustomAIModel) => (
            <div 
              key={model.id}
              onClick={() => setSelectedModel(model.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all relative group ${
                selectedModel === model.id
                  ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white">{model.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{model.purpose}</p>
                  {model.instructions && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                      {model.instructions}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedModel === model.id && (
                    <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(model.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded bg-red-500 text-white hover:bg-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Create New Button */}
          {!showCreateForm && models.length < 3 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
            >
              <Plus className="w-6 h-6 mx-auto text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Create Custom Model</p>
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Create New Model</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Study Helper, Exam Coach"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Purpose
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="What is this model for?"
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="How should this AI behave?"
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sources (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.sources}
                  onChange={(e) => setFormData({ ...formData, sources: e.target.value })}
                  placeholder="Book names, PDFs, websites..."
                  className="w-full px-4 py-2 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
