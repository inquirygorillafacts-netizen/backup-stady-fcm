'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Send, 
  Image as ImageIcon,
  FileText,
  Camera,
  Settings,
  Plus,
  MessageSquare,
  Mic,
  MicOff,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  History,
  Bot,
  User as UserIcon,
  Trash2,
  Copy,
  Share2,
  RotateCw,
  Zap,
  Brain,
  ScanLine,
  Upload,
  Download,
  Edit,
  Save,
  X,
  Workflow,
  Check,
  Heart,
  MoreVertical,
  Volume2,
  Pause,
  Play,
  Square,
  CircleDot
} from 'lucide-react';
import { toast } from 'sonner';
import { getFirebaseDatabase } from '@/lib/firebase';
import { ref, set, get, update } from 'firebase/database';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'pdf';
  imageUrl?: string;
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

export default function AIPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCustomModels, setShowCustomModels] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<'chat' | 'image-gen' | 'deep-research' | 'voice'>('chat');
  const [isRecording, setIsRecording] = useState(false);
  const [customModels, setCustomModels] = useState<CustomAIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchChats();
    loadCustomModels();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    toast.success('New chat created');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!currentChat) {
      createNewChat();
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

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getDemoResponse(selectedFeature),
        timestamp: new Date()
      };
      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      
      // Update chat in storage
      const updatedChat = { ...currentChat, messages: finalMessages };
      setCurrentChat(updatedChat);
      const updatedChats = chats.map(c => c.id === currentChat.id ? updatedChat : c);
      setChats(updatedChats);
      localStorage.setItem('aiChats', JSON.stringify(updatedChats));
      
      setLoading(false);
    }, 1500);
  };

  const getDemoResponse = (feature: string) => {
    switch (feature) {
      case 'image-gen':
        return '🎨 Image generation के लिए मैं आपके prompt के based पर beautiful images create कर सकता हूं। यह feature बाद में Google Gemini Nano Banana या DALL-E से integrate होगा।';
      case 'deep-research':
        return '🔍 Deep Research Mode: मैं आपके topic पर comprehensive research करूंगा, multiple sources से information gather करूंगा, और detailed analysis के साथ report provide करूंगा। यह feature बाद में fully functional होगा।';
      case 'voice':
        return '🎤 Voice-to-Voice mode में आप मुझसे बोलकर बात कर सकते हैं और मैं भी audio में respond करूंगा। यह Google Gemini Live API से integrate होगा।';
      default:
        return `मैं आपकी मदद के लिए यहां हूं! ${selectedModel ? `Current Model: ${customModels.find(m => m.id === selectedModel)?.name}` : ''}\n\nयह एक demo response है। Firebase और Google AI integration के बाद यह fully functional होगा।\n\n✨ Available Features:\n- Study materials और notes\n- Government job forms की information\n- Exam preparation tips\n- PDF generation\n- Image analysis\n- Deep research`;
    }
  };

  const handleFileUpload = (type: 'image' | 'pdf' | 'camera') => {
    toast.info(`${type} upload feature will be available after Firebase Storage integration`);
  };

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      toast.info('Voice recording started... (Feature pending)');
    } else {
      toast.info('Voice recording stopped');
    }
  };

  const handleGeneratePDF = () => {
    toast.info('PDF generation feature will create downloadable documents from chat history');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const handleShare = (message: Message) => {
    const shareUrl = `${window.location.origin}/shared/${message.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied! Others can view partial content and must login to read full.');
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

  const FEATURES = [
    { id: 'chat', label: 'Chat', icon: MessageSquare },
    { id: 'image-gen', label: 'Image Gen', icon: ImageIcon },
    { id: 'deep-research', label: 'Deep Research', icon: Zap },
    { id: 'voice', label: 'Voice Chat', icon: Mic },
  ];

  return (
    <div className="h-screen flex relative">
      {/* Chat History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 lg:relative lg:block">
          <div className="lg:hidden absolute inset-0 bg-black/50" onClick={() => setShowHistory(false)} />
          <div className="absolute lg:relative inset-y-0 left-0 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">History</h2>
                <button onClick={() => setShowHistory(false)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <button
                onClick={createNewChat}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Plus className="w-5 h-5" />
                New Chat
              </button>

              <div className="space-y-2">
                {chats.map((chat) => (
                  <div key={chat.id} className="relative group">
                    <button
                      onClick={() => {
                        setCurrentChat(chat);
                        setMessages(chat.messages || []);
                        setShowHistory(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        currentChat?.id === chat.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(chat.created_at).toLocaleDateString('hi-IN')}
                      </p>
                    </button>
                    <button
                      onClick={() => handleDeleteChat(chat.id)}
                      className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 bg-red-500 text-white hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <History className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-600" />
                  AI Assistant
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedModel 
                    ? customModels.find(m => m.id === selectedModel)?.name 
                    : 'Powered by Google AI'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCustomModels(!showCustomModels)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Custom AI Models"
              >
                <Workflow className="w-5 h-5" />
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feature Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    selectedFeature === feature.id
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {feature.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-6 max-w-2xl">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
                  <Bot className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Study Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  मैं आपकी study में मदद कर सकता हूं। Ask me anything!
                </p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: FileText, text: 'Generate Study PDFs' },
                    { icon: ImageIcon, text: 'Create Images' },
                    { icon: Zap, text: 'Deep Research' },
                    { icon: Camera, text: 'Scan & Analyze' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                      <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } animate-fade-in`}
              >
                {message.role === 'assistant' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-2xl shadow-lg ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button 
                      onClick={() => handleCopy(message.content)}
                      className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleShare(message)}
                      className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    {message.role === 'assistant' && (
                      <button className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                        <RotateCw className="w-4 h-4" />
                      </button>
                    )}
                    <span className="ml-auto text-xs opacity-60">
                      {new Date(message.timestamp).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                {message.role === 'user' && (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          {loading && (
            <div className="flex gap-3 animate-fade-in">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="max-w-4xl mx-auto">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-2">
              <button 
                onClick={() => handleFileUpload('image')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Upload Image"
              >
                <ImageIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => handleFileUpload('pdf')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Upload PDF"
              >
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={() => handleFileUpload('camera')}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Camera/Scanner"
              >
                <Camera className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button 
                onClick={handleVoiceToggle}
                className={`p-2 rounded-lg transition-colors ${
                  isRecording 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title="Voice Input"
              >
                <Mic className="w-5 h-5" />
              </button>
              <button 
                onClick={handleGeneratePDF}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Generate PDF"
              >
                <Download className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                {selectedFeature === 'voice' && 'Voice Mode Active 🎤'}
              </div>
            </div>

            {/* Input Field */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder={
                  selectedFeature === 'image-gen' 
                    ? 'Describe the image you want to generate...'
                    : selectedFeature === 'deep-research'
                    ? 'What topic should I research?'
                    : 'Type your message...'
                }
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Models Panel */}
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
function CustomModelsPanel({ 
  models, 
  setModels, 
  selectedModel, 
  setSelectedModel,
  onClose 
}: any) {
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Custom AI Models</h2>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
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
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl space-y-4">
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
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-500"
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
