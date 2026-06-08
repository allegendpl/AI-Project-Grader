import { motion } from 'framer-motion';
import {
  TrendingUp,
  Award,
  Target,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  BarChart3,
  Terminal,
  Activity,
  Zap,
} from 'lucide-react';
import { Project, getGradeFromScore, WEAKNESS_CONFIG, WeaknessType, Submission } from '../types';
import { identifyWeaknesses } from '../utils/gradingEngine';

interface ProgressViewProps {
  project: Project;
}

export default function ProgressView({ project }: ProgressViewProps) {
  const submissions = project.submissions;
  const hasData = submissions.length > 0;

  // Calculate progress data
  const progressData = hasData
    ? submissions.map(sub => ({
        version: sub.version,
        score: sub.totalScore,
        maxScore: sub.maxScore,
        percentage: Math.round((sub.totalScore / sub.maxScore) * 100),
        date: sub.createdAt,
      }))
    : [];

  // Calculate improvement
  const getImprovementStatus = () => {
    if (submissions.length < 2) return null;
    const latest = submissions[submissions.length - 1];
    const previous = submissions[submissions.length - 2];
    const diff = latest.totalScore - previous.totalScore;
    return {
      diff,
      isImprovement: diff > 0,
      percentage: Math.round((diff / previous.totalScore) * 100),
    };
  };

  const improvement = getImprovementStatus();

  // Calculate weakness data
  const weaknessData = hasData ? identifyWeaknesses(submissions) : [];

  // Calculate average scores per category
  const getCategoryAverages = () => {
    if (!hasData) return [];

    const categoryScores = new Map<string, { total: number; count: number; name: string }>();

    submissions.forEach(sub => {
      sub.categoryScores.forEach(score => {
        const criterion = project.rubric.find(c => c.id === score.criterionId);
        if (!criterion) return;

        const existing = categoryScores.get(score.criterionId) || {
          total: 0,
          count: 0,
          name: criterion.category,
        };
        existing.total += score.score;
        existing.count += 1;
        categoryScores.set(score.criterionId, existing);
      });
    });

    return Array.from(categoryScores.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      average: data.total / data.count,
    }));
  };

  const categoryAverages = getCategoryAverages();

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-cyber-cyan/30 bg-cyber-cyan/5">
          <Activity className="w-4 h-4 text-cyber-cyan" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyber-cyan/70">
            Analytics Engine
          </span>
        </div>

        <h1 className="text-3xl font-bold font-display mb-3">
          <span className="neon-cyan">PROGRESS DASHBOARD</span>
        </h1>

        <p className="text-gray-400 font-mono text-sm">
          Track performance metrics and identify improvement patterns
        </p>
      </motion.div>

      {hasData ? (
        <>
          {/* Stats Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            {/* Total Submissions */}
            <div className="cyber-card">
              <div className="cyber-card-inner p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-cyber-cyan/20 border border-cyber-cyan/30"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <Clock className="w-5 h-5 text-cyber-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Submissions</p>
                    <p className="text-2xl font-bold text-white font-mono">{submissions.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Latest Score */}
            <div className="cyber-card">
              <div className="cyber-card-inner p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-cyber-neon/20 border border-cyber-neon/30"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <Award className="w-5 h-5 text-cyber-neon" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Latest</p>
                    <p className="text-2xl font-bold neon-cyan font-mono">
                      {progressData[progressData.length - 1]?.percentage}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Improvement */}
            <div className="cyber-card">
              <div className="cyber-card-inner p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-10 h-10 flex items-center justify-center ${
                    improvement?.isImprovement ? 'bg-cyber-neon/20 border-cyber-neon/30' :
                    improvement?.diff < 0 ? 'bg-cyber-pink/20 border-cyber-pink/30' :
                    'bg-gray-800 border-gray-700'
                  } border`}
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    {improvement ? (
                      improvement.isImprovement ? (
                        <ArrowUpRight className="w-5 h-5 text-cyber-neon" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-cyber-pink" />
                      )
                    ) : (
                      <Minus className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Change</p>
                    <p className={`text-2xl font-bold font-mono ${
                      improvement?.isImprovement ? 'text-cyber-neon' :
                      improvement?.diff < 0 ? 'text-cyber-pink' : 'text-white'
                    }`}>
                      {improvement
                        ? improvement.isImprovement
                          ? `+${improvement.diff.toFixed(1)}`
                          : improvement.diff.toFixed(1)
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Best Score */}
            <div className="cyber-card">
              <div className="cyber-card-inner p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 flex items-center justify-center bg-cyber-magenta/20 border border-cyber-magenta/30"
                    style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}>
                    <Zap className="w-5 h-5 text-cyber-magenta" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-mono uppercase tracking-wider">Best</p>
                    <p className="text-2xl font-bold text-cyber-magenta font-mono">
                      {Math.max(...progressData.map(d => d.percentage))}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Score Progress Chart */}
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

              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="w-6 h-6 text-cyber-cyan" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Score Progression
                </h2>
              </div>

              <div className="relative h-64 mt-6">
                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between font-mono text-xs text-gray-600">
                  <span>100%</span>
                  <span>75%</span>
                  <span>50%</span>
                  <span>25%</span>
                  <span>0%</span>
                </div>

                {/* Chart area */}
                <div className="ml-14 h-56 relative">
                  {/* Grid lines */}
                  {[100, 75, 50, 25].map(pct => (
                    <div
                      key={pct}
                      className="absolute w-full border-t border-cyber-cyan/10"
                      style={{ top: `${100 - pct}%` }}
                    />
                  ))}

                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end justify-around gap-8 px-8">
                    {progressData.map((data, index) => (
                      <motion.div
                        key={data.version}
                        initial={{ height: 0 }}
                        animate={{ height: `${data.percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="relative flex flex-col items-center w-16"
                      >
                        <div
                          className={`w-full rounded-t-sm ${
                            data.percentage >= 90
                              ? 'bg-gradient-to-t from-cyber-neon/80 to-cyber-neon'
                              : data.percentage >= 70
                              ? 'bg-gradient-to-t from-cyber-cyan/80 to-cyber-cyan'
                              : data.percentage >= 50
                              ? 'bg-gradient-to-t from-yellow-500/80 to-yellow-400'
                              : 'bg-gradient-to-t from-cyber-pink/80 to-cyber-pink'
                          }`}
                          style={{ height: '100%', boxShadow: `0 0 20px ${data.percentage >= 70 ? '#00f0ff' : '#ff2a6d'}40` }}
                        />
                        <div className="absolute -top-8 text-sm font-bold neon-cyan font-mono">
                          {data.percentage}%
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* X-axis labels */}
                <div className="ml-14 flex justify-around mt-3">
                  {progressData.map(data => (
                    <div key={data.version} className="text-xs text-gray-500 font-mono">
                      v{data.version}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Category Performance */}
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

              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-cyber-magenta" />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                  Category Performance
                </h2>
              </div>

              <div className="space-y-4">
                {categoryAverages.map((cat, index) => {
                  const criterion = project.rubric.find(c => c.id === cat.id);
                  const maxPoints = criterion?.maxPoints || 10;
                  const percentage = (cat.average / maxPoints) * 100;

                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-white font-mono uppercase tracking-wider">{cat.name}</span>
                        <span className="text-sm text-gray-400 font-mono">
                          {cat.average.toFixed(1)}/{maxPoints}
                        </span>
                      </div>
                      <div className="cyber-progress">
                        <motion.div
                          className={`cyber-progress-fill ${
                            percentage >= 90
                              ? 'from-cyber-neon to-cyber-neon'
                              : percentage >= 70
                              ? 'from-cyber-cyan to-cyber-cyan'
                              : percentage >= 50
                              ? 'from-yellow-500 to-yellow-400'
                              : 'from-cyber-pink to-cyber-pink'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.5, delay: index * 0.05 }}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Weakness Analysis */}
          {weaknessData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="cyber-card"
            >
              <div className="cyber-card-inner">
                <div className="corner-accent tl"></div>
                <div className="corner-accent tr"></div>
                <div className="corner-accent bl"></div>
                <div className="corner-accent br"></div>

                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-xl font-bold text-white uppercase tracking-wider font-display">
                    Recurring Issues
                  </h2>
                </div>

                <p className="text-sm text-gray-500 font-mono mb-4">
                  Patterns identified across {submissions.length} submission{submissions.length > 1 ? 's' : ''}:
                </p>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weaknessData.map((weakness, index) => {
                    const config = WEAKNESS_CONFIG[weakness.type];
                    return (
                      <motion.div
                        key={weakness.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 border ${
                          weakness.severity === 'high'
                            ? 'bg-cyber-pink/10 border-cyber-pink/30'
                            : weakness.severity === 'medium'
                            ? 'bg-yellow-500/10 border-yellow-500/30'
                            : 'bg-black border-gray-800'
                        }`}
                        style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-white uppercase tracking-wider text-sm">{config?.label || weakness.type}</span>
                          <span
                            className={`status-badge ${
                              weakness.severity === 'high'
                                ? 'status-danger'
                                : weakness.severity === 'medium'
                                ? 'status-warning'
                                : 'status-info'
                            }`}
                          >
                            {weakness.severity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                          <span>{weakness.count} occurrence{weakness.count > 1 ? 's' : ''}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </>
      ) : (
        // Empty State
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 cyber-card"
        >
          <div className="cyber-card-inner">
            <div className="corner-accent tl"></div>
            <div className="corner-accent tr"></div>
            <div className="corner-accent bl"></div>
            <div className="corner-accent br"></div>

            <Terminal className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-bold text-gray-400 mb-2 uppercase tracking-wider font-display">
              No Data Available
            </h3>
            <p className="text-gray-500 mb-4 font-mono text-sm">
              Submit your first project to initialize analytics.
            </p>
            <p className="text-xs text-gray-600 font-mono">
              {'>'} Progress metrics will appear after grading.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
