import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Upload,
  FileCheck,
  BarChart3,
  TrendingUp,
  ChevronRight,
  X,
  Menu,
  MessageCircle,
  Cpu,
} from 'lucide-react';
import { Project, Submission, AppState } from './types';
import UploadView from './components/UploadView';
import RubricView from './components/RubricView';
import GradingView from './components/GradingView';
import ReportView from './components/ReportView';
import RevisionView from './components/RevisionView';
import ProgressView from './components/ProgressView';
import AIChatView from './components/AIChatView';

const initialState: AppState = {
  currentView: 'upload',
  project: null,
  currentSubmission: null,
  isProcessing: false,
  error: null,
};

export default function App() {
  const [state, setState] = useState<AppState>(initialState);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { id: 'upload', label: 'UPLOAD', icon: Upload, desc: 'Input data' },
    { id: 'rubric', label: 'RUBRIC', icon: FileCheck, desc: 'Define criteria' },
    { id: 'grading', label: 'ANALYZE', icon: Brain, desc: 'Process data' },
    { id: 'report', label: 'REPORT', icon: BarChart3, desc: 'View results' },
    { id: 'revision', label: 'REVISE', icon: TrendingUp, desc: 'Improve work' },
    { id: 'progress', label: 'TRACK', icon: TrendingUp, desc: 'Monitor progress' },
    { id: 'ai-chat', label: 'AI CHAT', icon: MessageCircle, desc: 'Get help' },
  ];

  const handleProjectCreate = (project: Project) => {
    setState(prev => ({
      ...prev,
      project,
      currentView: 'rubric',
    }));
  };

  const handleRubricComplete = () => {
    setState(prev => ({
      ...prev,
      currentView: 'grading',
    }));
  };

  const handleGradingComplete = (submission: Submission) => {
    setState(prev => ({
      ...prev,
      currentSubmission: submission,
      currentView: 'report',
    }));
  };

  const handleRevisionComplete = (newSubmission: Submission) => {
    setState(prev => {
      const updatedProject = prev.project
        ? {
            ...prev.project,
            submissions: [...prev.project.submissions, newSubmission],
          }
        : null;
      return {
        ...prev,
        project: updatedProject,
        currentSubmission: newSubmission,
        currentView: 'report',
      };
    });
  };

  const handleNavigate = (view: AppState['currentView'] | 'ai-chat') => {
    setState(prev => ({ ...prev, currentView: view as AppState['currentView'] }));
    setMobileMenuOpen(false);
  };

  const canNavigate = (view: string): boolean => {
    if (view === 'upload') return true;
    if (view === 'ai-chat') return true; // Always available
    if (!state.project) return false;
    if (view === 'rubric') return true;
    if (!state.project.rubric || state.project.rubric.length === 0) return false;
    if (view === 'grading') return true;
    if (!state.currentSubmission) return false;
    return true;
  };

  const renderView = () => {
    switch (state.currentView) {
      case 'upload':
        return (
          <UploadView
            onProjectCreate={handleProjectCreate}
            isProcessing={state.isProcessing}
            setIsProcessing={(isProcessing) => setState(prev => ({ ...prev, isProcessing }))}
          />
        );
      case 'rubric':
        return state.project ? (
          <RubricView
            project={state.project}
            onRubricComplete={handleRubricComplete}
            onUpdateProject={(updates) =>
              setState(prev => ({
                ...prev,
                project: prev.project ? { ...prev.project, ...updates } : null,
              }))
            }
          />
        ) : null;
      case 'grading':
        return state.project ? (
          <GradingView
            project={state.project}
            onGradingComplete={handleGradingComplete}
            isProcessing={state.isProcessing}
            setIsProcessing={(isProcessing) => setState(prev => ({ ...prev, isProcessing }))}
          />
        ) : null;
      case 'report':
        return state.project && state.currentSubmission ? (
          <ReportView
            project={state.project}
            submission={state.currentSubmission}
            onNavigateRevision={() => handleNavigate('revision')}
          />
        ) : null;
      case 'revision':
        return state.project && state.currentSubmission ? (
          <RevisionView
            project={state.project}
            previousSubmission={state.currentSubmission}
            onRevisionComplete={handleRevisionComplete}
          />
        ) : null;
      case 'progress':
        return state.project ? (
          <ProgressView project={state.project} />
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center p-12 bg-gray-900/50 border border-gray-800 rounded-lg">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 text-gray-500" />
              <p className="text-gray-400 font-mono text-sm">
                Upload a project to track progress
              </p>
            </div>
          </div>
        );
      case 'ai-chat':
        return (
          <AIChatView
            project={state.project}
            currentSubmission={state.currentSubmission}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* Background grid overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,240,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,240,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Gradient orbs */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-[#0a0a0f] border border-cyan-500/30 rounded-lg"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className={`hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-[#050508]/95 border-r border-gray-800 z-40 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } transition-transform duration-300`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 rounded-lg"
              animate={{ boxShadow: ['0 0 10px rgba(0,240,255,0.3)', '0 0 20px rgba(0,240,255,0.5)', '0 0 10px rgba(0,240,255,0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain className="w-5 h-5 text-cyan-400" />
            </motion.div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex flex-col"
                >
                  <span className="font-bold text-lg text-cyan-400 font-display tracking-wider">GRADEFLOW</span>
                  <span className="text-xs text-gray-500 font-mono">v2.0 AI_SYSTEM</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item, index) => {
            const Icon = item.icon;
            const isActive = state.currentView === item.id;
            const enabled = canNavigate(item.id);

            return (
              <motion.button
                key={item.id}
                onClick={() => enabled && handleNavigate(item.id as AppState['currentView'])}
                disabled={!enabled}
                className={`w-full flex items-center gap-3 px-3 py-3 font-mono text-xs uppercase tracking-wider transition-all rounded-lg ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : enabled
                    ? 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                    : 'text-gray-700 cursor-not-allowed opacity-40'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Icon className="w-4 h-4" />
                <AnimatePresence>
                  {sidebarOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-start"
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-gray-600 normal-case">{item.desc}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
                {isActive && sidebarOpen && (
                  <Cpu className="w-3 h-3 ml-auto text-cyan-400 animate-pulse" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 font-mono text-xs uppercase text-gray-600 hover:text-cyan-400 transition-colors"
          >
            <motion.div
              animate={{ rotate: sidebarOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronRight className="w-4 h-4" />
            </motion.div>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-sm z-30"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-72 bg-[#050508] border-r border-gray-800 z-40 p-4"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/50 rounded-lg">
                  <Brain className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <span className="font-bold text-cyan-400 font-display">GRADEFLOW</span>
                </div>
              </div>
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = state.currentView === item.id;
                  const enabled = canNavigate(item.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => enabled && handleNavigate(item.id as AppState['currentView'])}
                      disabled={!enabled}
                      className={`w-full flex items-center gap-3 px-4 py-3 font-mono text-xs uppercase tracking-wider rounded-lg ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400'
                          : enabled
                          ? 'text-gray-400'
                          : 'text-gray-700 opacity-40'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'
        }`}
      >
        <div className="min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="p-6 lg:p-8"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
