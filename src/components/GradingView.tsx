import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  Sparkles,
  ArrowRight,
  GraduationCap,
  BookOpen,
  MessageSquare,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Cpu,
  Zap,
} from 'lucide-react';
import { Project, Submission, TeacherMode, TEACHER_MODE_CONFIG } from '../types';
import { gradeProject } from '../utils/gradingEngine';

interface GradingViewProps {
  project: Project;
  onGradingComplete: (submission: Submission) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

export default function GradingView({
  project,
  onGradingComplete,
  isProcessing,
  setIsProcessing,
}: GradingViewProps) {
  const [teacherMode, setTeacherMode] = useState<TeacherMode>('high_school');
  const [teacherFeedback, setTeacherFeedback] = useState('');
  const [gradingStep, setGradingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const gradingSteps = [
    { label: 'Parsing project content', icon: Brain },
    { label: 'Extracting rubric criteria', icon: BookOpen },
    { label: 'Mapping evidence to requirements', icon: CheckCircle2 },
    { label: 'Computing category scores', icon: Cpu },
    { label: 'Generating analysis report', icon: MessageSquare },
  ];

  const handleStartGrading = async () => {
    setIsProcessing(true);
    setError(null);

    // Simulate step-by-step progress
    for (let i = 0; i < gradingSteps.length; i++) {
      setGradingStep(i);
      await new Promise(resolve => setTimeout(resolve, 600 + Math.random() * 400));
    }

    try {
      // Run the grading engine
      const result = gradeProject(
        project.content,
        project.rubric,
        teacherMode,
        teacherFeedback || undefined
      );

      const submission: Submission = {
        id: Math.random().toString(36).substring(2, 15),
        projectId: project.id,
        rubricId: Math.random().toString(36).substring(2, 15),
        version: project.submissions.length + 1,
        createdAt: new Date(),
        ...result,
      };

      setIsProcessing(false);
      onGradingComplete(submission);
    } catch (err) {
      setError('An error occurred during grading. Please try again.');
      setIsProcessing(false);
      setGradingStep(0);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-cyber-magenta/30 bg-cyber-magenta/5">
          <Cpu className="w-4 h-4 text-cyber-magenta" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyber-magenta/70">
            AI Engine Ready
          </span>
        </div>

        <h1 className="text-4xl font-bold font-display mb-3">
          <span className="neon-magenta" data-text="INITIATE ANALYSIS">INITIATE ANALYSIS</span>
        </h1>

        <p className="text-gray-400 font-mono text-sm">
          Configure grading parameters and execute AI evaluation
        </p>
      </motion.div>

      {/* Teacher Mode Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cyber-card mb-6"
      >
        <div className="cyber-card-inner">
          <div className="corner-accent tl"></div>
          <div className="corner-accent tr"></div>
          <div className="corner-accent bl"></div>
          <div className="corner-accent br"></div>

          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
            <GraduationCap className="w-5 h-5 text-cyber-cyan" />
            Grading Protocol
          </h3>

          <div className="grid sm:grid-cols-3 gap-4">
            {(Object.entries(TEACHER_MODE_CONFIG) as [TeacherMode, typeof TEACHER_MODE_CONFIG[TeacherMode]][]).map(
              ([mode, config]) => (
                <motion.button
                  key={mode}
                  onClick={() => setTeacherMode(mode)}
                  className={`p-4 border transition-all ${
                    teacherMode === mode
                      ? 'bg-cyber-cyan/10 border-cyber-cyan'
                      : 'bg-black border-gray-800 hover:border-gray-700'
                  }`}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-3xl mb-2">{config.emoji}</div>
                  <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-1 font-display">
                    {mode === 'elementary' ? 'Elementary' : mode === 'middle_school' ? 'Middle School' : 'High School'}
                  </h4>
                  <p className="text-xs text-gray-500 font-mono leading-relaxed">{config.description}</p>

                  {teacherMode === mode && (
                    <motion.div
                      layoutId="selectedMode"
                      className="w-6 h-6 mx-auto mt-3 flex items-center justify-center bg-cyber-cyan"
                      style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                    >
                      <CheckCircle2 className="w-4 h-4 text-black" />
                    </motion.div>
                  )}
                </motion.button>
              )
            )}
          </div>
        </div>
      </motion.div>

      {/* Teacher Feedback Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="cyber-card mb-6"
      >
        <div className="cyber-card-inner">
          <div className="corner-accent tl"></div>
          <div className="corner-accent tr"></div>
          <div className="corner-accent bl"></div>
          <div className="corner-accent br"></div>

          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 uppercase tracking-wider font-display">
            <MessageSquare className="w-5 h-5 text-cyber-magenta" />
            Teacher Input
          </h3>

          <p className="text-sm text-gray-500 font-mono mb-4">
            Optional: Add specific feedback or instructions from your teacher.
          </p>

          <textarea
            value={teacherFeedback}
            onChange={(e) => setTeacherFeedback(e.target.value)}
            placeholder="e.g., My teacher mentioned I need to work on transitions..."
            className="terminal-input h-28 resize-none"
          />
        </div>
      </motion.div>

      {/* Processing State */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="cyber-card mb-6"
          >
            <div className="cyber-card-inner">
              <div className="corner-accent tl"></div>
              <div className="corner-accent tr"></div>
              <div className="corner-accent bl"></div>
              <div className="corner-accent br"></div>

              <div className="flex items-center gap-3 mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Brain className="w-6 h-6 text-cyber-cyan" />
                </motion.div>
                <span className="font-mono text-cyber-cyan uppercase tracking-wider text-sm">
                  Processing Data...
                </span>
              </div>

              <div className="space-y-4">
                {gradingSteps.map((step, index) => {
                  const Icon = step.icon;
                  const isActive = gradingStep === index;
                  const isComplete = gradingStep > index;

                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: isActive || isComplete ? 1 : 0.4 }}
                      className="flex items-center gap-4"
                    >
                      <div
                        className={`w-10 h-10 flex items-center justify-center border ${
                          isComplete
                            ? 'bg-cyber-neon/20 border-cyber-neon text-cyber-neon'
                            : isActive
                            ? 'bg-cyber-cyan/20 border-cyber-cyan text-cyber-cyan'
                            : 'bg-black border-gray-800 text-gray-600'
                        }`}
                        style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
                      >
                        {isComplete ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : isActive ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            <Loader2 className="w-5 h-5" />
                          </motion.div>
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`font-mono text-sm ${
                          isActive ? 'text-cyber-cyan' : isComplete ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        {'>'} {step.label}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 flex items-center gap-2 p-4 bg-cyber-pink/10 border border-cyber-pink/30"
          >
            <AlertCircle className="w-5 h-5 text-cyber-pink" />
            <span className="text-cyber-pink font-mono text-sm">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Start Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handleStartGrading}
          disabled={isProcessing}
          className="cyber-btn cyber-btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          whileHover={isProcessing ? {} : { scale: 1.02 }}
          whileTap={isProcessing ? {} : { scale: 0.98 }}
        >
          <span className="flex items-center gap-3">
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-6 h-6" />
                </motion.div>
                <span>ANALYZING...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>EXECUTE ANALYSIS</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <p className="text-sm text-gray-500 font-mono">
          {'>'} Criteria: {project.rubric.length} | Max score: {project.rubric.reduce((sum, c) => sum + c.maxPoints, 0)} pts
        </p>
      </motion.div>
    </div>
  );
}
