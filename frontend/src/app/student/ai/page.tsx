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
  Volume2,
  Clock,
  MessageSquare,
  FileText,
  Workflow,
  Settings
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
  sorrows: string[];
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
          sorrows: [],
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
      title: 'नई बातचीत',
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
    toast.success('चैट का नाम बदल दिया गया');
  };

  const handleDeleteChat = (chatId: string) => {
    const updatedChats = chats.filter(c => c.id !== chatId);
    setChats(updatedChats);
    localStorage.setItem('aiChats', JSON.stringify(updatedChats));
    if (currentChat?.id === chatId) {
      setCurrentChat(null);
      setMessages([]);
    }
    toast.success('चैट डिलीट हो गई');
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
    const lowerMsg = message.toLowerCase();
    
    // Extract name
    if (lowerMsg.includes('my name is') || lowerMsg.includes('मेरा नाम')) {
      const nameMatch = message.match(/(?:my name is|मेरा नाम|मेरा नाम है) (\w+)/i);
      if (nameMatch) {
        updateUserBiography({ name: nameMatch[1] });
      }
    }

    // Extract work
    if (lowerMsg.includes('i work') || lowerMsg.includes('मैं काम') || lowerMsg.includes('मेरा काम')) {
      const workMatch = message.match(/(?:i work as|i am a|मैं|मेरा काम) (.+?)(?:\.|$)/i);
      if (workMatch) {
        updateUserBiography({ work: workMatch[1] });
      }
    }

    // Extract likes
    if (lowerMsg.includes('i like') || lowerMsg.includes('मुझे पसंद') || lowerMsg.includes('पसंद है')) {
      const likes = userBiography?.likes || [];
      const newLike = message.match(/(?:i like|मुझे पसंद है|पसंद है) (.+?)(?:\.|$)/i)?.[1];
      if (newLike && !likes.includes(newLike)) {
        updateUserBiography({ likes: [...likes, newLike] });
      }
    }

    // Extract dislikes
    if (lowerMsg.includes('i don\'t like') || lowerMsg.includes('मुझे नहीं पसंद') || lowerMsg.includes('नापसंद')) {
      const dislikes = userBiography?.dislikes || [];
      const newDislike = message.match(/(?:i don't like|मुझे नहीं पसंद|नापसंद) (.+?)(?:\.|$)/i)?.[1];
      if (newDislike && !dislikes.includes(newDislike)) {
        updateUserBiography({ dislikes: [...dislikes, newDislike] });
      }
    }

    // Extract goals
    if (lowerMsg.includes('my goal') || lowerMsg.includes('मेरा लक्ष्य') || lowerMsg.includes('मेरा सपना')) {
      const goals = userBiography?.goals || [];
      const newGoal = message.match(/(?:my goal|मेरा लक्ष्य|लक्ष्य|goal) (.+?)(?:\.|$)/i)?.[1];
      if (newGoal && !goals.includes(newGoal)) {
        updateUserBiography({ goals: [...goals, newGoal] });
      }
    }

    // Extract dreams
    if (lowerMsg.includes('dream') || lowerMsg.includes('सपना')) {
      const dreams = userBiography?.dreams || [];
      const newDream = message.match(/(?:dream|सपना) (.+?)(?:\.|$)/i)?.[1];
      if (newDream && !dreams.includes(newDream)) {
        updateUserBiography({ dreams: [...dreams, newDream] });
      }
    }

    // Extract relationship info (girlfriend, boyfriend)
    if (lowerMsg.includes('girlfriend') || lowerMsg.includes('boyfriend') || lowerMsg.includes('gf') || lowerMsg.includes('bf')) {
      const relationships = userBiography?.relationships || {};
      if (lowerMsg.includes('girlfriend') || lowerMsg.includes('gf')) {
        const gfMatch = message.match(/(?:girlfriend|gf)(?: is| का नाम)? (\w+)/i);
        if (gfMatch) {
          relationships.girlfriend = gfMatch[1];
        } else {
          relationships.girlfriend = 'yes';
        }
      }
      if (lowerMsg.includes('boyfriend') || lowerMsg.includes('bf')) {
        const bfMatch = message.match(/(?:boyfriend|bf)(?: is| का नाम)? (\w+)/i);
        if (bfMatch) {
          relationships.boyfriend = bfMatch[1];
        } else {
          relationships.boyfriend = 'yes';
        }
      }
      updateUserBiography({ relationships });
    }

    // Extract habits
    if (lowerMsg.includes('habit') || lowerMsg.includes('आदत')) {
      const habits = userBiography?.habits || [];
      const newHabit = message.match(/(?:habit|आदत) (.+?)(?:\.|$)/i)?.[1];
      if (newHabit && !habits.includes(newHabit)) {
        updateUserBiography({ habits: [...habits, newHabit] });
      }
    }

    // Extract sorrows/problems
    if (lowerMsg.includes('sad') || lowerMsg.includes('दुख') || lowerMsg.includes('problem') || lowerMsg.includes('समस्या')) {
      const sorrows = userBiography?.sorrows || [];
      const newSorrow = message.match(/(?:sad|दुख|problem|समस्या) (.+?)(?:\.|$)/i)?.[1];
      if (newSorrow && !sorrows.includes(newSorrow)) {
        updateUserBiography({ sorrows: [...sorrows, newSorrow] });
      }
    }
  };

  const getDemoResponse = (mode: AIMode) => {
    const userName = userBiography?.name || userData?.name || 'दोस्त';
    
    switch (mode) {
      case 'image-gen':
        return `नमस्ते ${userName}! 🎨 मैं आपके description के आधार पर image बना रहा हूं। यह feature Google Gemini Nano Banana integration के बाद पूरी तरह काम करेगा।`;
      case 'deep-research':
        return `${userName}, मैं आपके topic पर गहन research कर रहा हूं... 🔍 Multiple sources से data collect कर रहा हूं। Integration के बाद comprehensive analysis provide करूंगा।`;
      case 'pdf-gen':
        return `${userName}, मैं आपके लिए PDF document बना रहा हूं... 📄 यह feature integration के बाद available होगा।`;
      default:
        let response = `नमस्ते ${userName}! 👋 मैं आपका AI सहायक हूं।`;
        
        if (userBiography?.goals && userBiography.goals.length > 0) {
          response += `\n\nमुझे आपके लक्ष्य याद हैं: ${userBiography.goals.join(', ')}। मैं इनमें आपकी मदद करूंगा!`;
        }
        
        if (userBiography?.likes && userBiography.likes.length > 0) {
          response += `\n\nमुझे पता है आपको ${userBiography.likes[0]} पसंद है।`;
        }
        
        response += `\n\nयह एक demo response है। Firebase और Google AI integration के बाद, मैं हमारी पूरी conversation याद रखूंगा और आपके बारे में जो भी जानता हूं, उसके आधार पर personalized responses दूंगा।`;
        
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

    toast.success(updatedMessages.find(m => m.id === messageId)?.liked ? 'Liked में जोड़ा गया' : 'Liked से हटाया गया');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('कॉपी हो गया!');
  };

  const handleRegenerate = async () => {
    if (messages.length === 0) return;
    
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    if (!lastUserMessage) return;

    const messagesWithoutLastAI = messages.slice(0, -1);
    setMessages(messagesWithoutLastAI);
    setLoading(true);

    setTimeout(() => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getDemoResponse(selectedMode) + '\n\n(पुनः जनरेट किया गया)',
        timestamp: new Date()
      };
      const finalMessages = [...messagesWithoutLastAI, aiMessage];
      setMessages(finalMessages);
      
      // Update chat
      if (currentChat) {
        const updatedChat = { ...currentChat, messages: finalMessages };
        const updatedChats = chats.map(c => c.id === currentChat.id ? updatedChat : c);
        setChats(updatedChats);
        localStorage.setItem('aiChats', JSON.stringify(updatedChats));
      }
      
      setLoading(false);
    }, 1500);
  };

  const handleVoiceMode = () => {
    setIsVoiceMode(!isVoiceMode);
    if (!isVoiceMode) {
      toast.info('Voice mode चालू हो गया 🎤');
    } else {
      toast.info('Text mode में वापस आ गए');
      setIsRecording(false);
    }
  };

  const handleToggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('Recording शुरू हो गई... (Feature integration pending)');
    } else {
      toast.info('Recording बंद हो गई');
    }
  };

  const handleFileUpload = (type: 'camera' | 'gallery') => {
    toast.info(`${type === 'camera' ? 'Camera' : 'Gallery'} feature Firebase Storage integration के बाद available होगा`);
    setShowFileOptions(false);
  };

  const AI_MODES = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'image-gen', label: 'Image Generator', icon: ImageIcon },
    { id: 'deep-research', label: 'Deep Research', icon: Zap },
    { id: 'pdf-gen', label: 'PDF Generator', icon: FileText },
  ];

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" data-testid="ai-page">
      {/* Modern Glassmorphism Header */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-700/50 px-4 py-3 shadow-sm sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHistory(true)}
              className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all hover:scale-105"
              data-testid="history-button"
            >
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                {selectedModel 
                  ? customModels.find(m => m.id === selectedModel)?.name 
                  : 'AI Assistant'}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCustomModels(true)}
              className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all hover:scale-105"
              title="Custom Models"
              data-testid="custom-models-button"
            >
              <Workflow className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all hover:scale-105"
              data-testid="settings-button"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area with Smooth Scrolling */}
      <div className="flex-1 overflow-y-auto relative z-0" data-testid="messages-container">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center space-y-6 py-12 animate-fade-in">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-50 animate-pulse" />
                  <div className="relative w-24 h-24 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl">
                    <Bot className="w-12 h-12 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-purple-900 to-gray-900 dark:from-white dark:via-purple-200 dark:to-white bg-clip-text text-transparent mb-2">
                    नमस्ते {userData?.name || 'दोस्त'}! 👋
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    आज मैं आपकी कैसे मदद कर सकता हूं?
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {[
                    { icon: Sparkles, text: 'Ideas Generate करें', color: 'from-yellow-400 to-orange-500' },
                    { icon: Brain, text: 'Deep Research', color: 'from-blue-500 to-cyan-500' },
                    { icon: ImageIcon, text: 'Images बनाएं', color: 'from-pink-500 to-purple-500' },
                    { icon: Zap, text: 'Quick Answers', color: 'from-green-500 to-emerald-500' }
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInput(item.text)}
                      className={`p-4 bg-gradient-to-br ${item.color} text-white rounded-2xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200`}
                      data-testid={`quick-action-${idx}`}
                    >
                      <item.icon className="w-6 h-6 mb-2 mx-auto" />
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
                  } group animate-slide-up`}
                  data-testid={`message-${message.id}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex flex-col max-w-[85%]">
                    <div
                      className={`px-5 py-3 rounded-2xl shadow-md ${
                        message.role === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words leading-relaxed">{message.content}</p>
                    </div>
                    
                    {/* Message Actions */}
                    <div className={`flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}>
                      <button
                        onClick={() => handleCopy(message.content)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
                        title="Copy"
                        data-testid={`copy-message-${message.id}`}
                      >
                        <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      {message.role === 'assistant' && (
                        <>
                          <button
                            onClick={() => handleLikeMessage(message.id)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
                            title="Like"
                            data-testid={`like-message-${message.id}`}
                          >
                            <Heart className={`w-4 h-4 transition-all ${
                              message.liked 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-600 dark:text-gray-400'
                            }`} />
                          </button>
                          {index === messages.length - 1 && (
                            <button
                              onClick={handleRegenerate}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110"
                              title="Regenerate"
                              data-testid="regenerate-button"
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
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 animate-slide-up">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 px-5 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md">
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

      {/* Modern ChatGPT-like Input Area */}
      <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-4 sticky bottom-0 z-20">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-2">
            {/* Main Input Container with Embedded Controls */}
            <div className="flex-1 relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all hover:shadow-xl">
                <div className="flex items-center gap-2 px-4 py-3">
                  {/* Mode Dropdown Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowModeDropdown(!showModeDropdown)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105"
                      data-testid="mode-dropdown-button"
                    >
                      {(() => {
                        const ModeIcon = AI_MODES.find(m => m.id === selectedMode)?.icon || Sparkles;
                        return <ModeIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
                      })()}
                    </button>

                    {/* Mode Dropdown */}
                    {showModeDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-[220px] z-50 animate-slide-up" data-testid="mode-dropdown">
                        {AI_MODES.map((mode) => {
                          const Icon = mode.icon;
                          return (
                            <button
                              key={mode.id}
                              onClick={() => {
                                setSelectedMode(mode.id as AIMode);
                                setShowModeDropdown(false);
                                toast.success(`${mode.label} mode चुना गया`);
                              }}
                              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                selectedMode === mode.id
                                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 scale-105'
                                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                              }`}
                              data-testid={`mode-option-${mode.id}`}
                            >
                              <Icon className="w-5 h-5" />
                              <span className="font-medium">{mode.label}</span>
                              {selectedMode === mode.id && <Check className="w-4 h-4 ml-auto" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* File Upload Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFileOptions(!showFileOptions)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-105"
                      data-testid="file-upload-button"
                    >
                      <Plus className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    {/* File Options Dropdown */}
                    {showFileOptions && (
                      <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 min-w-[200px] z-50 animate-slide-up" data-testid="file-options-dropdown">
                        <button
                          onClick={() => handleFileUpload('camera')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
                          data-testid="camera-option"
                        >
                          <Camera className="w-5 h-5" />
                          <span className="font-medium">फोटो लें</span>
                        </button>
                        <button
                          onClick={() => handleFileUpload('gallery')}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
                          data-testid="gallery-option"
                        >
                          <ImageIcon className="w-5 h-5" />
                          <span className="font-medium">Gallery से चुनें</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Input Field */}
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                    placeholder={
                      selectedMode === 'image-gen' 
                        ? 'Image का वर्णन करें...'
                        : selectedMode === 'deep-research'
                        ? 'किस topic पर research करें?'
                        : 'AI को message भेजें...'
                    }
                    className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                    data-testid="message-input"
                  />
                </div>
              </div>
            </div>

            {/* Voice Mode Button */}
            <button
              onClick={handleVoiceMode}
              className={`p-4 rounded-full transition-all shadow-lg hover:shadow-xl hover:scale-105 ${
                isVoiceMode
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
              title="Voice Mode"
              data-testid="voice-mode-button"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
              data-testid="send-button"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
            AI से mistakes हो सकती हैं। Important जानकारी verify करें।
          </p>
        </div>
      </div>

      {/* Voice Mode Slide Up Panel */}
      {isVoiceMode && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md flex items-end" onClick={handleVoiceMode} data-testid="voice-mode-panel">
          <div 
            className="w-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 rounded-t-3xl p-8 animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleVoiceMode}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 transition-all backdrop-blur-sm"
              data-testid="close-voice-mode"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            <div className="text-center space-y-6">
              <div className="relative w-32 h-32 mx-auto">
                {/* Animated Voice Circles */}
                <div className={`absolute inset-0 rounded-full bg-white/20 ${isRecording ? 'animate-ping' : ''}`} />
                <div className={`absolute inset-4 rounded-full bg-white/30 ${isRecording ? 'animate-pulse' : ''}`} />
                <div className="absolute inset-8 rounded-full bg-white flex items-center justify-center shadow-2xl">
                  {isRecording ? (
                    <Volume2 className="w-12 h-12 text-purple-600 animate-pulse" />
                  ) : (
                    <Mic className="w-12 h-12 text-purple-600" />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-3xl font-bold text-white mb-2">
                  {isRecording ? 'सुन रहा हूं...' : 'Voice Mode'}
                </h3>
                <p className="text-white/90 text-lg">
                  {isRecording ? 'अब बोलें। मैं सुन रहा हूं।' : 'Voice conversation शुरू करने के लिए tap करें'}
                </p>
              </div>

              <button
                onClick={handleToggleRecording}
                className={`px-8 py-4 rounded-full font-semibold transition-all shadow-2xl hover:scale-105 ${
                  isRecording
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white text-purple-600 hover:bg-gray-100'
                }`}
                data-testid="toggle-recording-button"
              >
                {isRecording ? (
                  <span className="flex items-center gap-2">
                    <MicOff className="w-5 h-5" />
                    Recording बंद करें
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mic className="w-5 h-5" />
                    Recording शुरू करें
                  </span>
                )}
              </button>

              <p className="text-xs text-white/70">
                Voice-to-voice feature Google Gemini Live API integration के बाद available होगा
              </p>
            </div>
          </div>
        </div>
      )}

      {/* History Bottom Sheet with Modern Design */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-md" onClick={() => setShowHistory(false)} data-testid="history-panel">
          <div
            className="fixed inset-x-0 bottom-0 bg-white dark:bg-gray-900 rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle Bar */}
            <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white dark:bg-gray-900 z-10">
              <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between mb-4 sticky top-8 bg-white dark:bg-gray-900 py-2 z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <History className="w-5 h-5 text-white" />
                  </div>
                  Chat History
                </h2>
                <button
                  onClick={() => {
                    createNewChat();
                    setShowHistory(false);
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  data-testid="new-chat-button"
                >
                  <Plus className="w-4 h-4" />
                  नई Chat
                </button>
              </div>

              {chats.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                    <MessageSquare className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">अभी तक कोई chat नहीं है</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {chats.map((chat) => (
                    <div
                      key={chat.id}
                      className="group relative bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl p-4 hover:from-blue-50 hover:to-purple-50 dark:hover:from-blue-900/20 dark:hover:to-purple-900/20 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-purple-700 hover:shadow-lg"
                      data-testid={`chat-${chat.id}`}
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
                              className="w-full px-3 py-2 bg-white dark:bg-gray-900 rounded-xl border-2 border-blue-500 focus:outline-none shadow-inner"
                              autoFocus
                              data-testid={`edit-chat-input-${chat.id}`}
                            />
                          ) : (
                            <>
                              <p className="font-semibold text-gray-900 dark:text-white line-clamp-1 text-lg">
                                {chat.title}
                              </p>
                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3" />
                                {new Date(chat.created_at).toLocaleDateString('hi-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
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
                            className="p-2 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all hover:scale-110"
                            title="Rename"
                            data-testid={`rename-chat-${chat.id}`}
                          >
                            <Edit className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button
                            onClick={() => handleDeleteChat(chat.id)}
                            className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all hover:scale-110"
                            title="Delete"
                            data-testid={`delete-chat-${chat.id}`}
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

// Custom Models Panel Component
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
      toast.error('कृपया model का नाम दर्ज करें');
      return;
    }

    if (models.length >= 3) {
      toast.error('Maximum 3 custom models की अनुमति है');
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
    toast.success('Custom AI model बन गया!');
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
    toast.success('Model डिलीट हो गया');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md" data-testid="custom-models-panel">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-700">
        <div className="sticky top-0 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom AI Models</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all hover:scale-110" data-testid="close-custom-models">
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            विशेष उद्देश्यों के लिए 3 custom AI models बनाएं
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Default Model */}
          <div 
            onClick={() => setSelectedModel(null)}
            className={`p-5 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] ${
              selectedModel === null
                ? 'border-blue-600 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 hover:shadow-md'
            }`}
            data-testid="default-model"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-lg">Default AI</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">सामान्य उद्देश्य AI सहायक</p>
              </div>
              {selectedModel === null && (
                <div className="w-7 h-7 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
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
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all relative group hover:scale-[1.02] ${
                selectedModel === model.id
                  ? 'border-purple-600 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-400 hover:shadow-md'
              }`}
              data-testid={`custom-model-${model.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{model.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{model.purpose}</p>
                  {model.instructions && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 line-clamp-2">
                      {model.instructions}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {selectedModel === model.id && (
                    <div className="w-7 h-7 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(model.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all hover:scale-110"
                    data-testid={`delete-model-${model.id}`}
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
              className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all hover:scale-[1.02]"
              data-testid="create-model-button"
            >
              <Plus className="w-6 h-6 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Custom Model बनाएं</p>
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-2xl space-y-4 border border-gray-200 dark:border-gray-700" data-testid="create-model-form">
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">नया Model बनाएं</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model का नाम *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="उदा., Study Helper, Exam Coach"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  data-testid="model-name-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  उद्देश्य
                </label>
                <input
                  type="text"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="यह model किस लिए है?"
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  data-testid="model-purpose-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  निर्देश
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="यह AI कैसे व्यवहार करे?"
                  rows={3}
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  data-testid="model-instructions-input"
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
                  placeholder="पुस्तकों के नाम, PDFs, websites..."
                  className="w-full px-4 py-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  data-testid="model-sources-input"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  data-testid="cancel-create-model"
                >
                  रद्द करें
                </button>
                <button
                  onClick={handleCreate}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  data-testid="submit-create-model"
                >
                  बनाएं
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
