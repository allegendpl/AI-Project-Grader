import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  FileText,
  Terminal,
  Zap,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import { Project, Submission, getGradeFromScore, TEACHER_MODE_CONFIG } from '../types';

interface ReportViewProps {
  project: Project;
  submission: Submission;
  onNavigateRevision: () => void;
}

export default function ReportView({ project, submission, onNavigateRevision }: ReportViewProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('scores');
  const grade = getGradeFromScore(submission.totalScore, submission.maxScore);
  const percentage = Math.round((submission.totalScore / submission.maxScore) * 100);

  const getScoreColor = (score: number, max: number) => {
    const pct = (score / max) * 100;
    if (pct >= 90) return 'text-green-400';
    if (pct >= 70) return 'text-cyan-400';
    if (pct >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressBarColor = (pct: number) => {
    if (pct >= 90) return 'from-green-500 to-green-400';
    if (pct >= 70) return 'from-cyan-500 to-cyan-400';
    if (pct >= 50) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with Score Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="cyber-card mb-6"
      >
        <div className="cyber-card-inner">
          <div className="flex flex-col lg:flex-row items-center gap-8 p-4">
            {/* Circular Score */}
            <div className="relative">
              <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" />
                    <stop offset="50%" stopColor="#0066ff" />
                    <stop offset="100%" stopColor="#00ff88" />
                  </linearGradient>
                </defs>
                <circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  strokeWidth="12"
                  className="stroke-gray-800"
                />
                <motion.circle
                  cx="100"
                  cy="100"
                  r="88"
                  fill="none"
                  strokeWidth="12"
                  strokeLinecap="round"
                  stroke="url(#scoreGradient)"
                  initial={{ strokeDasharray: '0 553' }}
                  animate={{ strokeDasharray: `${(percentage / 100) * 553} 553` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="text-5xl font-bold text-cyan-400"
                >
                  {percentage}%
                </motion.span>
                <span className="text-2xl font-bold text-white">{grade.letter}</span>
              </div>
            </div>

            {/* Score Details */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full bg-cyan-400/10 border border-cyan-400/30">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-xs uppercase text-cyan-400">Analysis Complete</span>
              </div>

              <h1 className="text-3xl font-bold mb-2">
                <span className="text-cyan-400">ANALYSIS REPORT</span>
              </h1>
              <p className="text-gray-400 font-mono text-sm mb-6">{project.name}</p>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#0a0a12] border border-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-cyan-400 font-mono">
                    {submission.totalScore}/{submission.maxScore}
                  </div>
                  <div className="text-xs text-gray-500 font-mono uppercase">Score</div>
                </div>
                <div className="bg-[#0a0a12] border border-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-fuchsia-400 font-mono">
                    {submission.confidenceScore}%
                  </div>
                  <div className="text-xs text-gray-500 font-mono uppercase">Confidence</div>
                </div>
                <div className="bg-[#0a0a12] border border-gray-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-400 font-mono">
                    {submission.submissionReadiness}%
                  </div>
                  <div className="text-xs text-gray-500 font-mono uppercase">Readiness</div>
                </div>
                <div className="bg-[#0a0a12] border border-gray-800 rounded-lg p-4">
                  <div className={`text-2xl font-bold font-mono ${
                    submission.riskLevel === 'low' ? 'text-green-400' :
                    submission.riskLevel === 'medium' ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {submission.riskLevel.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-500 font-mono uppercase">Risk</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Category Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="cyber-card mb-6"
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'scores' ? null : 'scores')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
              Category Scores
            </h2>
          </div>
          {expandedSection === 'scores' ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'scores' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 pb-5 space-y-3"
          >
            {submission.categoryScores.map((score, index) => {
              const criterion = project.rubric.find(c => c.id === score.criterionId);
              if (!criterion) return null;

              const pct = (score.score / score.maxPoints) * 100;

              return (
                <motion.div
                  key={score.criterionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`criterion-card ${score.status}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {score.status === 'complete' ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                      ) : score.status === 'partial' ? (
                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                      <div>
                        <h4 className="font-bold text-white uppercase">{criterion.category}</h4>
                        <p className="text-sm text-gray-400">{criterion.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold font-mono ${getScoreColor(score.score, score.maxPoints)}`}>
                        {score.score}
                      </span>
                      <span className="text-gray-500 font-mono">/{score.maxPoints}</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="cyber-progress mb-3">
                    <motion.div
                      className={`cyber-progress-fill bg-gradient-to-r ${getProgressBarColor(pct)}`}
                      style={{ boxShadow: `0 0 10px ${pct >= 90 ? '#00ff88' : pct >= 70 ? '#00d4ff' : pct >= 50 ? '#fbbf24' : '#ff2255'}` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>

                  {/* Missing Items */}
                  {score.missingItems.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-yellow-400 mb-1 font-mono uppercase">Actions Needed:</p>
                      <ul className="space-y-1">
                        {score.missingItems.slice(0, 2).map((item, i) => (
                          <li key={i} className="text-sm text-gray-300 font-mono pl-3">
                            → {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Feedback */}
                  {score.feedback && (
                    <div className="mt-2 p-2 bg-black/40 border-l-2 border-cyan-400 rounded-r">
                      <p className="text-sm text-cyan-300 text-gray-300">{score.feedback}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Multi-Judge Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="cyber-card mb-6"
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'judges' ? null : 'judges')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-fuchsia-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
              Multi-Judge Analysis
            </h2>
          </div>
          {expandedSection === 'judges' ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'judges' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 pb-5"
          >
            <p className="text-sm text-gray-400 mb-4">
              Three AI judges analyzed your work with different strictness levels.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {submission.judgeScores.map((judge, index) => (
                <motion.div
                  key={judge.judgeType}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative p-4 bg-[#0a0a12] border border-gray-800 rounded-lg text-center overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500" />
                  <h4 className="font-bold text-white uppercase mb-2 font-display">
                    {judge.judgeType === 'strict' ? 'Strict' :
                     judge.judgeType === 'average' ? 'Average' : 'Lenient'}
                  </h4>
                  <div className="text-3xl font-bold text-cyan-400 font-mono mb-2">
                    {Math.round((judge.totalScore / submission.maxScore) * 100)}%
                  </div>
                  <p className="text-xs text-gray-400">{judge.feedback}</p>
                </motion.div>
              ))}
            </div>

            {/* Averaged Result */}
            <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-center">
              <p className="text-xs text-gray-400 font-mono uppercase mb-1">Weighted Average</p>
              <p className="text-3xl font-bold text-cyan-400 font-mono">{percentage}%</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Improvement Suggestions */}
      {submission.improvementSuggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="cyber-card mb-6"
        >
          <button
            onClick={() => setExpandedSection(expandedSection === 'improvements' ? null : 'improvements')}
            className="w-full flex items-center justify-between p-5 hover:bg-gray-900/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
                Improvement Plan
              </h2>
              <span className="status-badge status-warning">
                {submission.improvementSuggestions.length} items
              </span>
            </div>
            {expandedSection === 'improvements' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>

          {expandedSection === 'improvements' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="px-5 pb-5"
            >
              <p className="text-sm text-gray-400 mb-4">
                Priority-ranked actions. Complete these to gain points:
              </p>
              <div className="space-y-2">
                {submission.improvementSuggestions.slice(0, 8).map((suggestion, index) => (
                  <motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="improvement-item"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/20 border border-cyan-500/30 rounded font-mono font-bold text-cyan-400 text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-fuchsia-400 font-mono uppercase">
                          [{suggestion.category}]
                        </span>
                        <p className="text-sm text-gray-200 font-mono mt-0.5">
                          {suggestion.suggestion}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-green-400 font-mono font-bold text-lg">
                        +{suggestion.potentialPointsGain.toFixed(1)}
                      </span>
                      <span className="text-xs text-gray-500 font-mono">pts</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* AI Report */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="cyber-card mb-6"
      >
        <button
          onClick={() => setExpandedSection(expandedSection === 'report' ? null : 'report')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-900/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white uppercase tracking-wider font-display">
              Full Report
            </h2>
          </div>
          {expandedSection === 'report' ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {expandedSection === 'report' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="px-5 pb-5"
          >
            <div className="bg-[#050508] border border-gray-800 rounded-lg p-4 overflow-x-auto">
              <pre className="text-cyan-300 font-mono text-xs whitespace-pre leading-relaxed">
                {submission.aiReport}
              </pre>
            </div>

            {submission.teacherFeedback && (
              <div className="mt-4 p-4 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-lg">
                <p className="text-xs text-fuchsia-400 font-mono uppercase mb-1">
                  Teacher Notes:
                </p>
                <p className="text-gray-300 italic">{submission.teacherFeedback}</p>
              </div>
            )}

            <div className="mt-4 text-sm text-gray-400 font-mono">
              Mode: <span className="text-cyan-400">{TEACHER_MODE_CONFIG[submission.teacherMode].label}</span>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <motion.button
          onClick={onNavigateRevision}
          className="cyber-btn cyber-btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5" />
            <span>Submit Revision</span>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
