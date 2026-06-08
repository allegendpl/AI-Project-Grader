import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Edit3,
  Save,
  X,
  Terminal,
  Settings,
} from 'lucide-react';
import { Project, RubricCriterion } from '../types';
import { parseRubric } from '../utils/gradingEngine';

interface RubricViewProps {
  project: Project;
  onRubricComplete: () => void;
  onUpdateProject: (updates: Partial<Project>) => void;
}

interface EditingCriterion {
  id: string;
  data: Partial<RubricCriterion>;
}

export default function RubricView({ project, onRubricComplete, onUpdateProject }: RubricViewProps) {
  const [criteria, setCriteria] = useState<RubricCriterion[]>(project.rubric || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingCriterion | null>(null);
  const [newCriterionOpen, setNewCriterionOpen] = useState(false);
  const [newCriterion, setNewCriterion] = useState({
    category: '',
    description: '',
    maxPoints: 10,
    priority: 'medium' as 'high' | 'medium' | 'low',
  });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const handleAddCriterion = () => {
    if (!newCriterion.category.trim() || !newCriterion.description.trim()) return;

    const criterion: RubricCriterion = {
      id: generateId(),
      category: newCriterion.category,
      description: newCriterion.description,
      maxPoints: newCriterion.maxPoints,
      priority: newCriterion.priority,
      orderIndex: criteria.length,
    };

    setCriteria([...criteria, criterion]);
    setNewCriterion({ category: '', description: '', maxPoints: 10, priority: 'medium' });
    setNewCriterionOpen(false);
  };

  const handleUpdateCriterion = (id: string, updates: Partial<RubricCriterion>) => {
    setCriteria(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleDeleteCriterion = (id: string) => {
    setCriteria(prev => prev.filter(c => c.id !== id));
  };

  const handleStartEdit = (criterion: RubricCriterion) => {
    setEditingId(criterion.id);
    setEditingData({ id: criterion.id, data: { ...criterion } });
  };

  const handleSaveEdit = () => {
    if (editingId && editingData) {
      handleUpdateCriterion(editingId, editingData.data);
      setEditingId(null);
      setEditingData(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingData(null);
  };

  const handleContinue = () => {
    onUpdateProject({ rubric: criteria });
    onRubricComplete();
  };

  const handleAutoGenerate = () => {
    const defaultCriteria = parseRubric('');
    setCriteria(defaultCriteria);
  };

  const totalPoints = criteria.reduce((sum, c) => sum + c.maxPoints, 0);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 border border-cyber-neon/30 bg-cyber-neon/5">
          <Settings className="w-4 h-4 text-cyber-neon" />
          <span className="font-mono text-xs uppercase tracking-wider text-cyber-neon/70">
            Configuration Mode
          </span>
        </div>

        <h1 className="text-3xl font-bold font-display mb-3">
          <span className="neon-cyan">RUBRIC BUILDER</span>
        </h1>

        <p className="text-gray-400 font-mono text-sm">
          Define evaluation criteria. Each criterion will be analyzed independently.
        </p>
      </motion.div>

      {/* Criteria List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="space-y-4 mb-8"
      >
        <AnimatePresence mode="popLayout">
          {criteria.map((criterion, index) => (
            <motion.div
              key={criterion.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ delay: index * 0.05 }}
              className="cyber-card"
            >
              <div className="cyber-card-inner">
                <div className="corner-accent tl"></div>
                <div className="corner-accent tr"></div>
                <div className="corner-accent bl"></div>
                <div className="corner-accent br"></div>

                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className="p-2 hover:bg-cyber-cyan/10 cursor-grab text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {editingId === criterion.id && editingData ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editingData.data.category || ''}
                          onChange={(e) =>
                            setEditingData(prev =>
                              prev ? { ...prev, data: { ...prev.data, category: e.target.value } } : null
                            )
                          }
                          className="terminal-input"
                          placeholder="Category name"
                        />
                        <textarea
                          value={editingData.data.description || ''}
                          onChange={(e) =>
                            setEditingData(prev =>
                              prev ? { ...prev, data: { ...prev.data, description: e.target.value } } : null
                            )
                          }
                          className="terminal-input resize-none"
                          rows={3}
                          placeholder="Description"
                        />
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1 block">Points</label>
                            <input
                              type="number"
                              value={editingData.data.maxPoints || 10}
                              onChange={(e) =>
                                setEditingData(prev =>
                                  prev
                                    ? { ...prev, data: { ...prev.data, maxPoints: parseInt(e.target.value) || 10 } }
                                    : null
                                )
                              }
                              className="terminal-input"
                              min={1}
                              max={100}
                            />
                          </div>
                          <div className="flex-1">
                            <label className="text-xs text-gray-500 font-mono uppercase tracking-wider mb-1 block">Priority</label>
                            <select
                              value={editingData.data.priority || 'medium'}
                              onChange={(e) =>
                                setEditingData(prev =>
                                  prev
                                    ? { ...prev, data: { ...prev.data, priority: e.target.value as 'high' | 'medium' | 'low' } }
                                    : null
                                )
                              }
                              className="terminal-input"
                            >
                              <option value="high">High</option>
                              <option value="medium">Medium</option>
                              <option value="low">Low</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end pt-2">
                          <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-800 text-gray-400 font-mono text-xs uppercase tracking-wider hover:bg-gray-700 transition-colors">
                            <X className="w-4 h-4 inline mr-1" /> Cancel
                          </button>
                          <button onClick={handleSaveEdit} className="cyber-btn cyber-btn-primary px-4 py-2 text-xs">
                            <Save className="w-4 h-4 inline mr-1" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <h4 className="font-bold text-white uppercase tracking-wide">{criterion.category}</h4>
                            <span
                              className={`status-badge ${
                                criterion.priority === 'high'
                                  ? 'status-danger'
                                  : criterion.priority === 'medium'
                                  ? 'status-warning'
                                  : 'status-info'
                              }`}
                            >
                              {criterion.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold neon-cyan font-mono">{criterion.maxPoints}</span>
                            <span className="text-gray-500 font-mono text-xs">PTS</span>
                          </div>
                        </div>

                        <p className="text-gray-400 font-mono text-sm mb-3">{criterion.description}</p>

                        <div className="flex items-center justify-between">
                          <button
                            onClick={() =>
                              setExpandedId(expandedId === criterion.id ? null : criterion.id)
                            }
                            className="text-xs text-gray-600 hover:text-cyber-cyan flex items-center gap-1 font-mono uppercase tracking-wider transition-colors"
                          >
                            {expandedId === criterion.id ? (
                              <>
                                <ChevronUp className="w-4 h-4" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="w-4 h-4" />
                                Details
                              </>
                            )}
                          </button>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(criterion)}
                              className="p-2 hover:bg-cyber-cyan/10 text-gray-400 hover:text-cyber-cyan transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCriterion(criterion.id)}
                              className="p-2 hover:bg-cyber-pink/10 text-gray-400 hover:text-cyber-pink transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {criteria.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 cyber-card"
          >
            <div className="cyber-card-inner">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <h3 className="text-lg font-bold text-gray-400 mb-2 uppercase tracking-wider">No Criteria Defined</h3>
              <p className="text-gray-500 mb-4 font-mono text-sm">Add your first criterion or auto-generate defaults</p>
              <button onClick={handleAutoGenerate} className="cyber-btn text-cyber-cyan border-cyber-cyan/50">
                <Sparkles className="w-4 h-4 inline mr-2" />
                Auto-Generate
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Add New Criterion */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <AnimatePresence>
          {newCriterionOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="cyber-card mb-4"
            >
              <div className="cyber-card-inner">
                <div className="corner-accent tl"></div>
                <div className="corner-accent tr"></div>
                <div className="corner-accent bl"></div>
                <div className="corner-accent br"></div>

                <div className="space-y-4">
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-cyber-cyan/70 mb-2">
                      {'>'} Category Name
                    </label>
                    <input
                      type="text"
                      value={newCriterion.category}
                      onChange={(e) => setNewCriterion({ ...newCriterion, category: e.target.value })}
                      placeholder="e.g., Content & Ideas"
                      className="terminal-input"
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-xs uppercase tracking-wider text-cyber-cyan/70 mb-2">
                      {'>'} Description
                    </label>
                    <textarea
                      value={newCriterion.description}
                      onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
                      placeholder="Describe what you're looking for..."
                      className="terminal-input resize-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-cyber-cyan/70 mb-2">
                        Max Points
                      </label>
                      <input
                        type="number"
                        value={newCriterion.maxPoints}
                        onChange={(e) =>
                          setNewCriterion({ ...newCriterion, maxPoints: parseInt(e.target.value) || 10 })
                        }
                        className="terminal-input"
                        min={1}
                        max={100}
                      />
                    </div>
                    <div>
                      <label className="block font-mono text-xs uppercase tracking-wider text-cyber-cyan/70 mb-2">
                        Priority
                      </label>
                      <select
                        value={newCriterion.priority}
                        onChange={(e) =>
                          setNewCriterion({
                            ...newCriterion,
                            priority: e.target.value as 'high' | 'medium' | 'low',
                          })
                        }
                        className="terminal-input"
                      >
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setNewCriterionOpen(false)}
                      className="px-4 py-2 bg-gray-800 text-gray-400 font-mono text-xs uppercase tracking-wider hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCriterion}
                      disabled={!newCriterion.category.trim() || !newCriterion.description.trim()}
                      className="cyber-btn cyber-btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <CheckCircle2 className="w-4 h-4 inline mr-1" />
                      Add Criterion
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setNewCriterionOpen(true)}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 border-2 border-dashed border-cyber-cyan/30 hover:border-cyber-cyan hover:bg-cyber-cyan/5 text-gray-400 hover:text-cyber-cyan font-mono text-sm uppercase tracking-wider transition-all"
        >
          <Plus className="w-5 h-5" />
          Add New Criterion
        </button>
      </motion.div>

      {/* Total Points & Continue */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex items-center gap-4 text-gray-400 font-mono">
          <span className="uppercase tracking-wider text-xs">Total Points:</span>
          <span className="text-4xl font-bold neon-cyan">{totalPoints}</span>
        </div>

        <motion.button
          onClick={handleContinue}
          disabled={criteria.length === 0}
          className="cyber-btn cyber-btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))' }}
          whileHover={criteria.length > 0 ? { scale: 1.02 } : {}}
          whileTap={criteria.length > 0 ? { scale: 0.98 } : {}}
        >
          <span className="flex items-center gap-3">
            <Terminal className="w-5 h-5" />
            <span>Start Grading</span>
            <ArrowRight className="w-5 h-5" />
          </span>
        </motion.button>

        {criteria.length === 0 && (
          <p className="text-sm text-cyber-pink flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4" />
            Add at least one criterion to continue
          </p>
        )}
      </motion.div>
    </div>
  );
}
