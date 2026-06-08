export type ProjectType = 'essay' | 'slides' | 'code' | 'video' | 'image' | 'audio' | 'mixed';
export type TeacherMode = 'elementary' | 'middle_school' | 'high_school';
export type RiskLevel = 'low' | 'medium' | 'high';
export type CriterionStatus = 'missing' | 'partial' | 'complete';
export type WeaknessType = 'writing' | 'evidence' | 'organization' | 'grammar' | 'analysis' | 'creativity' | 'critical_thinking';

export interface RubricCriterion {
  id: string;
  category: string;
  description: string;
  maxPoints: number;
  priority: 'high' | 'medium' | 'low';
  orderIndex: number;
}

export interface CategoryScore {
  criterionId: string;
  score: number;
  maxPoints: number;
  confidence: number;
  evidenceFound: string[];
  evidenceLocations: string[];
  missingItems: string[];
  status: CriterionStatus;
  feedback: string;
  justification: string;
}

export interface ImprovementSuggestion {
  id: string;
  criterionId: string;
  suggestion: string;
  potentialPointsGain: number;
  priority: number;
  category: string;
}

export interface JudgeScore {
  judgeType: 'strict' | 'average' | 'lenient';
  totalScore: number;
  feedback: string;
}

export interface Weakness {
  weaknessType: WeaknessType;
  weaknessDescription: string;
  occurrenceCount: number;
  severity: 'low' | 'medium' | 'high';
}

export interface Submission {
  id: string;
  projectId: string;
  rubricId: string;
  version: number;
  teacherMode: TeacherMode;
  teacherFeedback?: string;
  totalScore: number;
  maxScore: number;
  confidenceScore: number;
  submissionReadiness: number;
  riskLevel: RiskLevel;
  aiReport: string;
  categoryScores: CategoryScore[];
  improvementSuggestions: ImprovementSuggestion[];
  judgeScores: JudgeScore[];
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  projectType: ProjectType;
  content: string;
  rubric: RubricCriterion[];
  submissions: Submission[];
  weaknesses: Weakness[];
  createdAt: Date;
}

export interface AppState {
  currentView: 'upload' | 'rubric' | 'grading' | 'report' | 'revision' | 'progress' | 'ai-chat';
  project: Project | null;
  currentSubmission: Submission | null;
  isProcessing: boolean;
  error: string | null;
}

export const PROJECT_TYPE_CONFIG: Record<ProjectType, { label: string; icon: string; description: string }> = {
  essay: { label: 'Essay', icon: 'FileText', description: 'Written essays and papers' },
  slides: { label: 'Slides', icon: 'Presentation', description: 'Presentation slides (PPTX)' },
  code: { label: 'Code', icon: 'Code', description: 'Programming projects' },
  video: { label: 'Video', icon: 'Video', description: 'Video submissions' },
  image: { label: 'Image', icon: 'Image', description: 'Scanned or image-based work' },
  audio: { label: 'Audio', icon: 'Mic', description: 'Audio or speech submissions' },
  mixed: { label: 'Mixed', icon: 'Layers', description: 'Multiple file types' },
};

export const TEACHER_MODE_CONFIG: Record<TeacherMode, { label: string; emoji: string; description: string; strictness: number }> = {
  elementary: { label: 'Elementary Teacher', emoji: '👶', description: 'Simple expectations, encouraging tone, focus on effort', strictness: 0.6 },
  middle_school: { label: 'Middle School Teacher', emoji: '🧠', description: 'Balanced grading, basic structure and evidence', strictness: 0.8 },
  high_school: { label: 'High School Teacher', emoji: '🎓', description: 'Strict grading, deep analysis, formal feedback', strictness: 1.0 },
};

export const WEAKNESS_CONFIG: Record<WeaknessType, { label: string; color: string }> = {
  writing: { label: 'Writing Quality', color: '#ef4444' },
  evidence: { label: 'Evidence & Support', color: '#f97316' },
  organization: { label: 'Organization', color: '#eab308' },
  grammar: { label: 'Grammar & Mechanics', color: '#22c55e' },
  analysis: { label: 'Analysis Depth', color: '#3b82f6' },
  creativity: { label: 'Creativity', color: '#8b5cf6' },
  critical_thinking: { label: 'Critical Thinking', color: '#ec4899' },
};

export function getGradeFromScore(score: number, maxScore: number): { letter: string; range: string } {
  const percentage = (score / maxScore) * 100;
  if (percentage >= 93) return { letter: 'A', range: '93-100%' };
  if (percentage >= 90) return { letter: 'A-', range: '90-92%' };
  if (percentage >= 87) return { letter: 'B+', range: '87-89%' };
  if (percentage >= 83) return { letter: 'B', range: '83-86%' };
  if (percentage >= 80) return { letter: 'B-', range: '80-82%' };
  if (percentage >= 77) return { letter: 'C+', range: '77-79%' };
  if (percentage >= 73) return { letter: 'C', range: '73-76%' };
  if (percentage >= 70) return { letter: 'C-', range: '70-72%' };
  if (percentage >= 67) return { letter: 'D+', range: '67-69%' };
  if (percentage >= 63) return { letter: 'D', range: '63-66%' };
  if (percentage >= 60) return { letter: 'D-', range: '60-62%' };
  return { letter: 'F', range: '0-59%' };
}
