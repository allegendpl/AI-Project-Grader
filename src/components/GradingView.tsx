import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Loader2,
  AlertCircle,
  Trash2,
  FileText,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { Project, Submission, RubricCriterion } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatViewProps {
  project: Project | null;
  currentSubmission: Submission | null;
}

export default function AIChatView({ project, currentSubmission }: AIChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (messages.length === 0 && project) {
      // Add welcome message
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Hi! I'm GradeFlow AI, your academic assistant. I've analyzed your project "${project.name}" and I'm ready to help.\n\nHere's what I can do:\n• Explain your scores and feedback\n• Help you improve specific areas\n• Answer questions about your rubric\n• Brainstorm revision strategies\n• Give writing and research advice\n\nWhat would you like to know?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [project]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content,
          })),
          projectContext: project ? {
            name: project.name,
            type: project.projectType,
            content: project.content,
            rubric: project.rubric.map((c: RubricCriterion) => ({
              category: c.category,
              description: c.description,
              maxPoints: c.maxPoints,
            })),
            latestSubmission: currentSubmission ? {
              totalScore: currentSubmission.totalScore,
              maxScore: currentSubmission.maxScore,
              categoryScores: currentSubmission.categoryScores.map(s => {
                const criterion = project.rubric.find(c => c.id === s.criterionId);
                return {
                  category: criterion?.category || 'Unknown',
                  score: s.score,
                  maxPoints: s.maxPoints,
                  status: s.status,
                  feedback: s.feedback,
                };
              }),
            } : undefined,
          } : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to get response');
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message || data.message,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to AI');

      // Add fallback message
      const fallbackMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please make sure the OpenAI API key is configured in your Supabase project.\n\nTo add the key:\n1. Go to your Supabase dashboard\n2. Navigate to Edge Functions > Secrets\n3. Add OPENAI_API_KEY with your OpenAI API key",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    }

    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const clearChat = () => {
    if (project) {
      const welcomeMessage: ChatMessage = {
        id: 'welcome',
        role: 'assistant',
        content: `Chat cleared. I still have access to your project "${project.name}". How can I help?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    } else {
      setMessages([]);
    }
  };

  const quickQuestions = [
    "Explain my lowest scoring area",
    "How can I improve my thesis?",
    "What's my strongest section?",
    "Give me revision priorities",
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center bg-cyber-cyan/20 border border-cyber-cyan"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
              <Bot className="w-6 h-6 text-cyber-cyan" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                AI Assistant
              </h1>
              <p className="text-xs text-gray-400 font-mono">
                {project ? `Analyzing: ${project.name}` : 'Ready to help'}
              </p>
            </div>
          </div>
          {messages.length > 1 && (
            <button
              onClick={clearChat}
              className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 transition-colors font-mono uppercase tracking-wider"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </motion.div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto bg-black/40 border border-gray-800 rounded-lg mb-4">
        <div className="p-4 space-y-4 min-h-full">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/50 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-cyber-cyan" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-cyber-cyan/20 border border-cyber-cyan/30'
                      : 'bg-gray-800/50 border border-gray-700'
                  }`}
                >
                  <p className="text-gray-100 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                    {message.content}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-cyber-cyan/20 border border-cyber-cyan/50 flex items-center justify-center">
                <Bot className="w-4 h-4 text-cyber-cyan" />
              </div>
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Loader2 className="w-4 h-4 text-cyber-cyan" />
                  </motion.div>
                  <span className="text-gray-400 text-sm font-mono">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && project && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex flex-wrap gap-2"
        >
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(question);
                inputRef.current?.focus();
              }}
              className="px-3 py-2 text-xs font-mono text-gray-400 bg-gray-800/50 border border-gray-700 hover:border-cyber-cyan/50 hover:text-cyber-cyan transition-all rounded"
            >
              {question}
            </button>
          ))}
        </motion.div>
      )}

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your project, scores, or how to improve..."
            className="w-full px-4 py-3 bg-black/60 border border-gray-700 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:border-cyber-cyan transition-colors rounded-lg"
            rows={2}
            disabled={isLoading || !project}
          />
          {!project && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <span className="text-gray-500 font-mono text-sm">
                Upload a project to start chatting
              </span>
            </div>
          )}
        </div>
        <button
          type="submit"
          disabled={!input.trim() || isLoading || !project}
          className="px-6 py-3 bg-cyber-cyan text-black font-bold uppercase tracking-wider hover:bg-cyber-cyan/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all rounded-lg flex items-center gap-2"
          style={{
            clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))'
          }}
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5" />
            </motion.div>
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      {/* Project Context Summary */}
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4 p-3 bg-gray-900/50 border border-gray-800 rounded-lg"
        >
          <div className="flex items-center gap-4 text-xs font-mono text-gray-500">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{project.rubric.length} criteria</span>
            </div>
            {currentSubmission && (
              <>
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  <span>
                    Score: {currentSubmission.totalScore}/{currentSubmission.maxScore}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={
                    currentSubmission.riskLevel === 'low' ? 'text-cyber-neon' :
                    currentSubmission.riskLevel === 'medium' ? 'text-yellow-500' :
                    'text-cyber-pink'
                  }>
                    Risk: {currentSubmission.riskLevel}
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
