"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

// Helper function to serialize messages for localStorage
const serializeMessages = (messages: Message[]): string => {
  return JSON.stringify(messages.map(msg => ({
    ...msg,
    timestamp: msg.timestamp.toISOString()
  })));
};

// Helper function to deserialize messages from localStorage
const deserializeMessages = (data: string): Message[] => {
  try {
    const parsed = JSON.parse(data);
    return parsed.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
  } catch (error) {
    console.error('Error deserializing messages:', error);
    return [];
  }
};

interface ChatBotProps {
  resumeId?: string;
  onUploadResume?: () => void;
}

export default function ChatBot({ resumeId, onUploadResume }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    if (resumeId) {
      const storageKey = `chat_messages_${resumeId}`;
      const savedMessages = localStorage.getItem(storageKey);
      
      if (savedMessages) {
        const deserializedMessages = deserializeMessages(savedMessages);
        setMessages(deserializedMessages);
      } else {
        // Initialize with welcome message if no saved messages
        const welcomeMessage: Message = {
          id: '1',
          text: "Hello! I'm your professional resume analyst. I can help you understand your resume strengths, identify areas for improvement, and provide career insights based on your experience. Upload your resume to begin our professional consultation.",
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    } else {
      // Reset messages when no resume is selected
      setMessages([]);
    }
  }, [resumeId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (resumeId && messages.length > 0) {
      const storageKey = `chat_messages_${resumeId}`;
      const serializedMessages = serializeMessages(messages);
      localStorage.setItem(storageKey, serializedMessages);
    }
  }, [messages, resumeId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!resumeId) {
      toast.error('Please upload a resume first to begin consultation!', {
        className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      console.log('Sending chat request:', {
        resumeId,
        question: inputText,
        hasToken: !!localStorage.getItem('token')
      });

      const response = await fetch('/api/rag/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          resumeId,
          question: inputText
        })
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error details:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.answer) {
        console.error('No answer in response data:', data);
        throw new Error('No answer received from server');
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.answer,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      const errorStack = error instanceof Error ? error.stack : undefined;
      
      console.error('Error sending message:', {
        error: error,
        message: errorMessage,
        stack: errorStack,
        resumeId,
        question: inputText
      });
      
      let userErrorMessage = 'Unable to process your request. Please try again.';
      if (errorMessage.includes('HTTP 500')) {
        userErrorMessage = 'Service temporarily unavailable. Please try again later.';
      } else if (errorMessage.includes('HTTP 401')) {
        userErrorMessage = 'Authentication required. Please log in again.';
      } else if (errorMessage.includes('HTTP 404')) {
        userErrorMessage = 'Service endpoint not available. Please contact support.';
      }
      
      toast.error(userErrorMessage, {
        className: 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChatHistory = () => {
    if (resumeId) {
      const storageKey = `chat_messages_${resumeId}`;
      localStorage.removeItem(storageKey);
      const welcomeMessage: Message = {
        id: Date.now().toString(),
        text: "Hello! I'm your professional resume analyst. I can help you understand your resume strengths, identify areas for improvement, and provide career insights based on your experience. Upload your resume to begin our professional consultation.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      toast.success('Chat history cleared!', {
        className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
      });
    }
  };

  const suggestedQuestions = [
    "What are my key professional skills?",
    "Summarize my career experience",
    "What are my strongest qualifications?",
    "How can I improve my resume?",
    "What career opportunities match my profile?"
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl shadow-2xl border border-gray-100">
  {/* Header */}
  <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-3xl">
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
        <Bot className="w-6 h-6 text-white" />
      </div>
      <div>
        <h3 className="font-semibold text-lg text-gray-900">Professional Resume Analyst</h3>
        <p className="text-sm text-gray-600">Ask anything related to your resume</p>
      </div>
    </div>
    {resumeId && messages.length > 1 && (
      <button
        onClick={clearChatHistory}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
        title="Clear chat history"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    )}
  </div>

  {/* Messages */}
  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-white">
    {messages.map((message) => (
      <div
        key={message.id}
        className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-[85%] rounded-2xl px-5 py-3 shadow-sm ${
            message.sender === 'user'
              ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          <div className="flex items-start gap-2">
            {message.sender === 'bot' && (
              <Bot className="w-4 h-4 mt-1 text-blue-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              
            </div>
            {message.sender === 'user' && (
              <User className="w-4 h-4 mt-1 text-blue-100 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    ))}

    {isLoading && (
      <div className="flex justify-start">
        <div className="bg-gray-100 rounded-2xl px-5 py-3 flex items-center gap-2 shadow">
          <Bot className="w-4 h-4 text-blue-500" />
          <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          <span className="text-sm text-gray-600">AI is thinking...</span>
        </div>
      </div>
    )}

    <div ref={messagesEndRef} />
  </div>

  {/* Suggested Questions */}
  {messages.length === 1 && resumeId && messages[0]?.sender === 'bot' && (
    <div className="px-5 pb-4">
      <p className="text-sm text-gray-600 mb-2">Try asking:</p>
      <div className="flex flex-wrap gap-2">
        {suggestedQuestions.map((question, index) => (
          <button
            key={index}
            onClick={() => setInputText(question)}
            className="cursor-pointer text-xs bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full hover:bg-blue-100 transition-all"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )}

  {/* Upload Resume Prompt */}
  {!resumeId && (
    <div className="px-5 pb-4">
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 text-center shadow-sm">
        <FileText className="w-8 h-8 text-amber-600 mx-auto mb-2" />
        <p className="text-sm text-amber-800 mb-3">
          Upload your resume to begin your career consultation
        </p>
        <button
          onClick={onUploadResume}
          className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition"
        >
          <Upload className="w-4 h-4" />
          Upload Resume
        </button>
      </div>
    </div>
  )}

  {/* Input */}
  <div className="p-2 lg:p-10 border-t border-gray-100 bg-white">
    <div className="flex gap-3">
      <input
        type="text"
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={resumeId ? "Ask about your resume..." : "Upload a resume to begin..."}
        disabled={!resumeId || isLoading}
        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all"
      />
      <button
        onClick={sendMessage}
        disabled={!inputText.trim() || isLoading || !resumeId}
        className="px-5 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </div>
  </div>
</div>

  );
} 