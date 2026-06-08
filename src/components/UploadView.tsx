import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  FileCode,
  Presentation,
  Image,
  Video,
  Music,
  Layers,
  X,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Terminal,
  Zap,
  Database,
} from 'lucide-react';
import { Project, ProjectType, RubricCriterion, PROJECT_TYPE_CONFIG } from '../types';
import { detectProjectType, formatFileSize } from '../utils/fileUtils';
import { parseRubric } from '../utils/gradingEngine';

interface UploadViewProps {
  onProjectCreate: (project: Project) => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
}

interface UploadedFile {
  file: File;
  type: ProjectType;
  content: string;
}

const projectTypeIcons: Record<ProjectType, React.ComponentType<{ className?: string }>> = {
  essay: FileText,
  code: FileCode,
  slides: Presentation,
  video: Video,
  image: Image,
  audio: Music,
  mixed: Layers,
};

export default function UploadView({ onProjectCreate, isProcessing, setIsProcessing }: UploadViewProps) {
  const [projectFiles, setProjectFiles] = useState<UploadedFile[]>([]);
  const [rubricFile, setRubricFile] = useState<UploadedFile | null>(null);
  const [rubricText, setRubricText] = useState('');
  const [projectName, setProjectName] = useState('');
  const [draggedType, setDraggedType] = useState<'project' | 'rubric' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileRead = async (file: File): Promise<UploadedFile> => {
    const type = detectProjectType(file);
    const content = await readFileContent(file);
    return { file, type, content };
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleProjectDrop = useCallback(async (files: FileList) => {
    setError(null);
    setIsProcessing(true);
    try {
      const uploadedFiles = await Promise.all(
        Array.from(files).map(file => handleFileRead(file))
      );
      setProjectFiles(prev => [...prev, ...uploadedFiles]);
      if (!projectName && uploadedFiles[0]) {
        setProjectName(uploadedFiles[0].file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch (err) {
      setError('Failed to read files. Please try again.');
    }
    setIsProcessing(false);
  }, [projectName, setIsProcessing]);

  const handleRubricDrop = useCallback(async (files: FileList) => {
    setError(null);
    setIsProcessing(true);
    try {
      const uploaded = await handleFileRead(files[0]);
      setRubricFile(uploaded);
      setRubricText(uploaded.content);
    } catch (err) {
      setError('Failed to read rubric file. Please try again.');
    }
    setIsProcessing(false);
  }, [setIsProcessing]);

  const handleDrop = useCallback((e: React.DragEvent, type: 'project' | 'rubric') => {
    e.preventDefault();
    setDraggedType(null);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      if (type === 'project') {
        handleProjectDrop(files);
      } else {
        handleRubricDrop(files);
      }
    }
  }, [handleProjectDrop, handleRubricDrop]);

  const handleDragOver = useCallback((e: React.DragEvent, type: 'project' | 'rubric') => {
    e.preventDefault();
    setDraggedType(type);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDraggedType(null);
  }, []);

  const removeProjectFile = (index: number) => {
    setProjectFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (projectFiles.length === 0) {
      setError('ERROR: Project files required. Upload your work to continue.');
      return;
    }

    if (!rubricText.trim() && !rubricFile) {
      setError('ERROR: Rubric required. Upload a rubric file or paste criteria to continue.');
      return;
    }

    if (rubricText.trim().length < 20 && !rubricFile) {
      setError('ERROR: Rubric too short. Please provide detailed grading criteria.');
      return;
    }

    const combinedContent = projectFiles.map(f => `=== ${f.file.name} ===\n${f.content}`).join('\n\n');
    const detectedType = projectFiles.length > 1 ? 'mixed' : projectFiles[0].type;

    let parsedRubric: RubricCriterion[] = [];
    if (rubricText.trim()) {
      parsedRubric = parseRubric(rubricText);
    }

    if (parsedRubric.length === 0) {
      setError('ERROR: Could not parse rubric. Please provide clearer criteria with point values.');
      return;
    }

    const project: Project = {
      id: Math.random().toString(36).substring(2, 15),
      name: projectName || 'Untitled Project',
      projectType: detectedType,
      content: combinedContent,
      rubric: parsedRubric,
      submissions: [],
      weaknesses: [],
      createdAt: new Date(),
    };

    onProjectCreate(project);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-cyber-cyan/30 bg-cyber-cyan/5">
          <Terminal className="w-4 h-4 text-cyber-cyan" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyber-cyan/70">
            System Ready
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold font-display mb-4">
          <span className="neon-cyan" data-text="UPLOAD PROJECT">UPLOAD PROJECT</span>
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto font-mono text-sm">
          Initialize analysis by uploading your project files. AI will parse
          and evaluate your work against specified criteria.
        </p>
      </motion.div>

      {/* Project Name Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <label className="block font-mono text-xs uppercase tracking-wider text-cyber-cyan/70 mb-2">
          {'>'} Project Identifier
        </label>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Enter project name..."
          className="terminal-input"
        />
      </motion.div>

      {/* Upload Areas */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Project Files Upload */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onDrop={(e) => handleDrop(e, 'project')}
          onDragOver={(e) => handleDragOver(e, 'project')}
          onDragLeave={handleDragLeave}
          className={`cyber-card`}
        >
          <div className="cyber-card-inner">
            <div className="corner-accent tl"></div>
            <div className="corner-accent tr"></div>
            <div className="corner-accent bl"></div>
            <div className="corner-accent br"></div>

            <div className="text-center mb-4 relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-cyber-cyan/10 border border-cyber-cyan/30 flex items-center justify-center">
                <Database className="w-8 h-8 text-cyber-cyan" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display uppercase tracking-wider">
                Project Files
              </h3>
              <p className="text-sm text-gray-500 font-mono">
                Drag & drop files or click to browse
              </p>
            </div>

            {/* File List */}
            <AnimatePresence>
              {projectFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2 relative z-10"
                >
                  {projectFiles.map((uploaded, index) => {
                    const Icon = projectTypeIcons[uploaded.type];
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-3 p-3 bg-black border border-cyber-cyan/20"
                      >
                        <Icon className="w-5 h-5 text-cyber-cyan" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-mono truncate">{uploaded.file.name}</p>
                          <p className="text-xs text-gray-600 font-mono">{formatFileSize(uploaded.file.size)}</p>
                        </div>
                        <button
                          onClick={() => removeProjectFile(index)}
                          className="p-1 hover:bg-cyber-pink/20 text-gray-400 hover:text-cyber-pink transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            <label className={`mt-4 flex items-center justify-center gap-2 px-4 py-4 cursor-pointer transition-all upload-zone ${
              draggedType === 'project' ? 'active' : ''
            } relative z-10`}>
              <Upload className="w-5 h-5 text-cyber-cyan" />
              <span className="text-gray-400 font-mono text-sm uppercase tracking-wider">Browse Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => e.target.files && handleProjectDrop(e.target.files)}
              />
            </label>
          </div>
        </motion.div>

        {/* Rubric Upload */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          onDrop={(e) => handleDrop(e, 'rubric')}
          onDragOver={(e) => handleDragOver(e, 'rubric')}
          onDragLeave={handleDragLeave}
          className={`cyber-card`}
        >
          <div className="cyber-card-inner">
            <div className="corner-accent tl"></div>
            <div className="corner-accent tr"></div>
            <div className="corner-accent bl"></div>
            <div className="corner-accent br"></div>

            <div className="text-center mb-4 relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-sm bg-cyber-magenta/10 border border-cyber-magenta/30 flex items-center justify-center">
                <FileText className="w-8 h-8 text-cyber-magenta" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2 font-display uppercase tracking-wider">
                Rubric Data
              </h3>
              <p className="text-sm text-gray-500 font-mono">
                Optional - Upload or paste criteria
              </p>
            </div>

            <label className={`mt-4 flex items-center justify-center gap-2 px-4 py-3 cursor-pointer transition-all upload-zone ${
              draggedType === 'rubric' ? 'active border-cyber-magenta' : ''
            } relative z-10`}>
              <Upload className="w-5 h-5 text-cyber-magenta" />
              <span className="text-gray-400 font-mono text-sm uppercase tracking-wider">Upload Rubric</span>
              <input
                type="file"
                accept=".txt,.pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => e.target.files && handleRubricDrop(e.target.files)}
              />
            </label>

            {rubricFile && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 flex items-center gap-2 p-2 bg-cyber-neon/10 border border-cyber-neon/30 relative z-10"
              >
                <CheckCircle2 className="w-4 h-4 text-cyber-neon" />
                <span className="text-sm text-white font-mono">{rubricFile.file.name}</span>
                <button
                  onClick={() => {
                    setRubricFile(null);
                    setRubricText('');
                  }}
                  className="ml-auto p-1 hover:bg-gray-700"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </motion.div>
            )}

            <div className="mt-4 relative z-10">
              <label className="block font-mono text-xs uppercase tracking-wider text-cyber-magenta/70 mb-2">
                {'>'} Or paste rubric text:
              </label>
              <textarea
                value={rubricText}
                onChange={(e) => setRubricText(e.target.value)}
                placeholder={`Content & Ideas (25 points): Demonstrates understanding...
Organization (20 points): Well-structured...
Evidence & Support (20 points): Uses specific examples...`}
                className="terminal-input h-28 resize-none text-sm font-mono"
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Message */}
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
          onClick={handleSubmit}
          disabled={projectFiles.length === 0 || !rubricText.trim() || isProcessing}
          className="cyber-btn cyber-btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          whileHover={!isProcessing && projectFiles.length > 0 && rubricText.trim() ? { scale: 1.02 } : {}}
          whileTap={!isProcessing && projectFiles.length > 0 && rubricText.trim() ? { scale: 0.98 } : {}}
        >
          <span className="flex items-center gap-3">
            {isProcessing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>INITIALIZE ANALYSIS</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Validation Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex flex-wrap justify-center gap-4"
      >
        <div className={`flex items-center gap-2 px-4 py-2 border ${
          projectFiles.length > 0 ? 'border-cyber-neon/50 bg-cyber-neon/10' : 'border-gray-700 bg-gray-900/50'
        }`}>
          {projectFiles.length > 0 ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-cyber-neon" />
              <span className="font-mono text-xs text-cyber-neon">PROJECT UPLOADED</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="font-mono text-xs text-gray-500">PROJECT REQUIRED</span>
            </>
          )}
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 border ${
          rubricText.trim() ? 'border-cyber-neon/50 bg-cyber-neon/10' : 'border-gray-700 bg-gray-900/50'
        }`}>
          {rubricText.trim() ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-cyber-neon" />
              <span className="font-mono text-xs text-cyber-neon">RUBRIC PROVIDED</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 text-gray-500" />
              <span className="font-mono text-xs text-gray-500">RUBRIC REQUIRED</span>
            </>
          )}
        </div>
      </motion.div>

      {/* Project Type Detection */}
      {projectFiles.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500 font-mono">
            DETECTED TYPE:{' '}
            <span className="neon-cyan font-bold">
              {PROJECT_TYPE_CONFIG[projectFiles.length > 1 ? 'mixed' : projectFiles[0].type].label}
            </span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
