import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  X,
  Terminal,
  Zap,
  GitBranch,
} from 'lucide-react';
import { Project, Submission, TeacherMode, TEACHER_MODE_CONFIG } from '../types';
import { gradeProject } from '../utils/gradingEngine';
import { formatFileSize } from '../utils/fileUtils';

interface RevisionViewProps {
  project: Project;
  previousSubmission: Submission;
  onRevisionComplete: (submission: Submission) => void;
}

interface UploadedFile {
  file: File;
  content: string;
}

export default function RevisionView({
  project,
  previousSubmission,
  onRevisionComplete,
}: RevisionViewProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [revisedContent, setRevisedContent] = useState('');
  const [teacherMode, setTeacherMode] = useState<TeacherMode>(previousSubmission.teacherMode);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    try {
      const content = await readFileContent(file);
      setUploadedFile({ file, content });
      setRevisedContent(content);
    } catch {
      setError('Failed to read file. Please try again.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleSubmitRevision = async () => {
    if (!revisedContent.trim()) {
      setError('Please upload or paste your revised content.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const result = gradeProject(
        revisedContent,
        project.rubric,
        teacherMode,
        previousSubmission.teacherFeedback
      );

      const newSubmission: Submission = {
        id: Math.random().toString(36).substring(2, 15),
        projectId: project.id,
        rubricId: Math.random().toString(36).substring(2, 15),
        version: previousSubmission.version + 1,
        createdAt: new Date(),
        ...result,
      };

      setIsProcessing(false);
      onRevisionComplete(newSubmission);
    } catch {
      setError('Failed to process revision. Please try again.');
      setIsProcessing(false);
    }
  };

  const prevPercentage = Math.round(
    (previousSubmission.totalScore / previousSubmission.maxScore) * 100
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-cyber-neon/30 bg-cyber-neon/5">
          <GitBranch className="w-4 h-4 text-cyber-neon" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyber-neon/70">
            Version Control
          </span>
        </div>

        <h1 className="text-3xl font-bold font-display mb-3">
          <span className="neon-cyan">REVISION MODE</span>
        </h1>

        <p className="text-gray-400 font-mono text-sm">
          Submit revision v{previousSubmission.version + 1}. Track improvements against previous version.
        </p>
      </motion.div>

      {/* Previous Score Summary */}
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

          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-white uppercase tracking-wider font-display">
              Version {previousSubmission.version}
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center bg-black border border-cyber-cyan/20 p-3">
              <div className="text-2xl font-bold text-cyber-cyan font-mono">{prevPercentage}%</div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Score</div>
            </div>
            <div className="text-center bg-black border border-cyber-cyan/20 p-3">
              <div className="text-2xl font-bold text-gray-300 font-mono">
                {previousSubmission.totalScore}/{previousSubmission.maxScore}
              </div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Points</div>
            </div>
            <div className="text-center bg-black border border-cyber-neon/20 p-3">
              <div className="text-2xl font-bold text-cyber-neon font-mono">
                {previousSubmission.categoryScores.filter(s => s.status === 'complete').length}
              </div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Complete</div>
            </div>
            <div className="text-center bg-black border border-yellow-500/20 p-3">
              <div className="text-2xl font-bold text-yellow-500 font-mono">
                {previousSubmission.categoryScores.filter(s => s.status !== 'complete').length}
              </div>
              <div className="text-xs text-gray-500 font-mono uppercase tracking-wider">Needs Work</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Upload Area */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`cyber-card mb-6 transition-all ${dragOver ? 'border-cyber-neon' : ''}`}
      >
        <div className="cyber-card-inner">
          <div className="corner-accent tl"></div>
          <div className="corner-accent tr"></div>
          <div className="corner-accent bl"></div>
          <div className="corner-accent br"></div>

          <div className="text-center mb-6">
            <Upload className="w-10 h-10 mx-auto mb-4 text-cyber-cyan" />
            <h3 className="text-lg font-bold text-white mb-2 uppercase tracking-wider font-display">
              Upload Revised Version
            </h3>
            <p className="text-sm text-gray-500 font-mono">
              Drag & drop or paste your revised content below
            </p>
          </div>

          {/* Uploaded File */}
          <AnimatePresence>
            {uploadedFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 flex items-center justify-between p-3 bg-cyber-neon/10 border border-cyber-neon/30"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-cyber-neon" />
                  <div>
                    <p className="text-sm text-white font-mono">{uploadedFile.file.name}</p>
                    <p className="text-xs text-gray-500 font-mono">{formatFileSize(uploadedFile.file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setUploadedFile(null);
                    setRevisedContent('');
                  }}
                  className="p-1 hover:bg-gray-700 text-gray-400 hover:text-cyber-pink transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <label className={`flex items-center justify-center gap-2 px-4 py-4 cursor-pointer transition-all upload-zone ${
            dragOver ? 'active border-cyber-neon' : ''
          }`}>
            <Upload className="w-5 h-5 text-cyber-cyan" />
            <span className="text-gray-400 font-mono text-sm uppercase tracking-wider">Browse Files</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            />
          </label>

          <div className="mt-4">
            <label className="block font-mono text-xs uppercase tracking-wider text-cyber-cyan/70 mb-2">
              {'>'} Or paste revised content:
            </label>
            <textarea
              value={revisedContent}
              onChange={(e) => setRevisedContent(e.target.value)}
              placeholder="Paste your revised project content here..."
              className="terminal-input h-40 resize-none"
            />
          </div>
        </div>
      </motion.div>

      {/* Teacher Mode */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="cyber-card mb-6"
      >
        <div className="cyber-card-inner">
          <div className="corner-accent tl"></div>
          <div className="corner-accent tr"></div>
          <div className="corner-accent bl"></div>
          <div className="corner-accent br"></div>

          <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider font-display">
            Grading Protocol
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.entries(TEACHER_MODE_CONFIG) as [TeacherMode, typeof TEACHER_MODE_CONFIG[TeacherMode]][]).map(
              ([mode, config]) => (
                <button
                  key={mode}
                  onClick={() => setTeacherMode(mode)}
                  className={`p-3 border transition-all ${
                    teacherMode === mode
                      ? 'bg-cyber-cyan/10 border-cyber-cyan'
                      : 'bg-black border-gray-800 hover:border-gray-700'
                  }`}
                  style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
                >
                  <div className="text-xl mb-1">{config.emoji}</div>
                  <div className="text-xs text-gray-400 font-mono uppercase">
                    {mode === 'elementary' ? 'Elem' : mode === 'middle_school' ? 'Middle' : 'High'}
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      </motion.div>

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

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={handleSubmitRevision}
          disabled={isProcessing || !revisedContent.trim()}
          className="cyber-btn cyber-btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          whileHover={!isProcessing && revisedContent.trim() ? { scale: 1.02 } : {}}
          whileTap={!isProcessing && revisedContent.trim() ? { scale: 0.98 } : {}}
        >
          <span className="flex items-center gap-3">
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <RefreshCw className="w-6 h-6" />
                </motion.div>
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Zap className="w-6 h-6" />
                <span>ANALYZE REVISION</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
