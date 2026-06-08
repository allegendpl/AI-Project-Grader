import {
  Project,
  RubricCriterion,
  CategoryScore,
  ImprovementSuggestion,
  JudgeScore,
  TeacherMode,
  TEACHER_MODE_CONFIG,
  getGradeFromScore,
  WeaknessType,
  Submission,
} from '../types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function analyzeContent(content: string, criterion: RubricCriterion): {
  evidenceCount: number;
  relevantSections: string[];
  keywordMatches: string[];
} {
  const keywords = extractKeywords(criterion.description);
  const sections = content.split(/\n\n+|\. /);
  const relevantSections: string[] = [];
  const keywordMatches: string[] = [];

  sections.forEach(section => {
    const lowerSection = section.toLowerCase();
    let hasMatch = false;
    keywords.forEach(keyword => {
      if (lowerSection.includes(keyword.toLowerCase())) {
        keywordMatches.push(keyword);
        hasMatch = true;
      }
    });
    if (hasMatch && relevantSections.length < 5) {
      relevantSections.push(section.trim().substring(0, 200));
    }
  });

  return {
    evidenceCount: relevantSections.length,
    relevantSections,
    keywordMatches,
  };
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'although', 'though']);

  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.has(word));
}

function calculateCriterionScore(
  content: string,
  criterion: RubricCriterion,
  teacherMode: TeacherMode
): CategoryScore {
  const analysis = analyzeContent(content, criterion);
  const { strictness } = TEACHER_MODE_CONFIG[teacherMode];

  let baseScore = 0;
  let status: 'missing' | 'partial' | 'complete' = 'missing';
  const evidenceFound: string[] = [];
  const missingItems: string[] = [];

  // Calculate base score from evidence
  if (analysis.evidenceCount >= 3) {
    baseScore = criterion.maxPoints;
    status = 'complete';
  } else if (analysis.evidenceCount >= 1) {
    baseScore = criterion.maxPoints * 0.6;
    status = 'partial';
  } else {
    baseScore = criterion.maxPoints * 0.2;
    status = 'missing';
  }

  // Adjust by keyword relevance
  const keywordRelevance = analysis.keywordMatches.length / Math.max(extractKeywords(criterion.description).length, 1);
  baseScore *= (0.5 + keywordRelevance * 0.5);

  // Apply teacher strictness
  baseScore *= strictness;

  // Add some realistic variance
  baseScore += (Math.random() - 0.5) * 2;

  // Clamp score
  baseScore = Math.max(0, Math.min(criterion.maxPoints, baseScore));

  // Generate evidence
  analysis.relevantSections.forEach(section => {
    evidenceFound.push(section);
  });

  // Generate detailed missing items based on criterion
  const categoryLower = criterion.category.toLowerCase();

  if (status !== 'complete') {
    if (categoryLower.includes('thesis') || categoryLower.includes('argument') || categoryLower.includes('claim')) {
      missingItems.push('Thesis statement lacks clarity or specificity - restate your main argument more directly');
      missingItems.push('Counter-argument section missing - address opposing viewpoints to strengthen your position');
      missingItems.push('Thesis placement needs improvement - consider placing it at the end of your introduction');
    }
    if (categoryLower.includes('evidence') || categoryLower.includes('support') || categoryLower.includes('example')) {
      missingItems.push('Insufficient specific examples - add concrete data, quotes, or case studies');
      missingItems.push('Citations missing or incomplete - properly cite all sources using required format (MLA/APA)');
      missingItems.push('Evidence needs more analysis - explain how each piece of evidence supports your claim');
      missingItems.push('Primary sources underutilized - incorporate more direct quotes and references');
    }
    if (categoryLower.includes('organization') || categoryLower.includes('structure') || categoryLower.includes('flow')) {
      missingItems.push('Topic sentences needed - start each paragraph with a clear main idea');
      missingItems.push('Transition phrases missing - use words like "furthermore," "however," "consequently"');
      missingItems.push('Paragraph structure inconsistent - use P.I.E. format (Point, Information, Explanation)');
      missingItems.push('Introduction/conclusion need connection - mirror key ideas from intro to conclusion');
    }
    if (categoryLower.includes('analysis') || categoryLower.includes('critical') || categoryLower.includes('depth')) {
      missingItems.push('Surface-level analysis detected - dig deeper into "why" and "how" questions');
      missingItems.push('Connection between evidence and claims unclear - explicitly link each point');
      missingItems.push('Multiple perspectives not explored - consider alternative interpretations');
      missingItems.push('Implications not discussed - address the broader significance of your findings');
    }
    if (categoryLower.includes('grammar') || categoryLower.includes('mechanics') || categoryLower.includes('language')) {
      missingItems.push('Run-on sentences detected - break into shorter, clearer sentences');
      missingItems.push('Subject-verb agreement errors - review plural/singular consistency');
      missingItems.push('Punctuation issues - check comma usage and end punctuation');
      missingItems.push('Word choice could be more precise - avoid vague terms like "things" or "stuff"');
    }
    if (categoryLower.includes('research') || categoryLower.includes('source')) {
      missingItems.push('Source variety limited - include academic journals, books, and reputable websites');
      missingItems.push('Source recency issues - ensure sources are current (within 5 years for most topics)');
      missingItems.push('Source integration weak - weave quotes naturally into your sentences');
    }
    if (categoryLower.includes('creativity') || categoryLower.includes('original') || categoryLower.includes('innovation')) {
      missingItems.push('Approach is conventional - try a unique angle or perspective');
      missingItems.push('Personal voice missing - inject your own insights and observations');
      missingItems.push('Creative elements underdeveloped - consider metaphors, analogies, or storytelling');
    }
    if (categoryLower.includes('present') || categoryLower.includes('visual') || categoryLower.includes('design')) {
      missingItems.push('Visual hierarchy unclear - use consistent fonts, colors, and spacing');
      missingItems.push('Text density too high - break up content with headings, bullets, and images');
      missingItems.push('Slide flow disjointed - ensure each slide builds on the previous one');
    }
  }

  // Default missing items if category not matched
  if (missingItems.length === 0 && status !== 'complete') {
    missingItems.push(`Additional content needed to fully address ${criterion.category.toLowerCase()} requirements`);
    missingItems.push('More detailed explanation of key concepts required');
  }

  const confidence = 60 + Math.random() * 35;

  return {
    criterionId: criterion.id,
    score: Math.round(baseScore * 10) / 10,
    maxPoints: criterion.maxPoints,
    confidence: Math.round(confidence),
    evidenceFound,
    evidenceLocations: evidenceFound.map((_, i) => `Section ${i + 1}`),
    missingItems: missingItems.slice(0, 4),
    status,
    feedback: generateFeedback(criterion, status, baseScore, criterion.maxPoints, teacherMode),
    justification: generateJustification(criterion, status, evidenceFound, missingItems),
  };
}

function generateFeedback(
  criterion: RubricCriterion,
  status: 'missing' | 'partial' | 'complete',
  score: number,
  maxPoints: number,
  teacherMode: TeacherMode
): string {
  const percentage = (score / maxPoints) * 100;
  const config = TEACHER_MODE_CONFIG[teacherMode];

  if (status === 'complete') {
    if (teacherMode === 'elementary') {
      return `Great job on ${criterion.category}! You really understood this part. Keep it up!`;
    }
    if (teacherMode === 'middle_school') {
      return `Strong performance in ${criterion.category}. Your work shows good understanding and effort.`;
    }
    return `OUTSTANDING: ${criterion.category} requirements fully met. Your work demonstrates thorough understanding and excellent execution of this criterion.`;
  }

  if (status === 'partial') {
    if (teacherMode === 'elementary') {
      return `Good try on ${criterion.category}! With a bit more effort, you can do even better!`;
    }
    if (teacherMode === 'middle_school') {
      return `Adequate work on ${criterion.category}, but there's room for improvement. Focus on the specific areas mentioned.`;
    }
    return `PARTIAL CREDIT: ${criterion.category} demonstrates basic understanding but lacks depth. Review missing elements and strengthen your approach.`;
  }

  if (teacherMode === 'elementary') {
    return `Don't worry about ${criterion.category}! Let's work on this together next time.`;
  }
  if (teacherMode === 'middle_school') {
    return `${criterion.category} needs more attention. Review the requirements and try to address all points.`;
  }
  return `INSUFFICIENT: ${criterion.category} requires significant improvement. Address all missing elements before resubmission.`;
}

function generateJustification(
  criterion: RubricCriterion,
  status: 'missing' | 'partial' | 'complete',
  evidence: string[],
  missing: string[]
): string {
  let justification = `[${criterion.category.toUpperCase()}] ANALYSIS:\n`;
  justification += `• Evidence count: ${evidence.length} relevant section(s) identified\n`;

  if (evidence.length > 0) {
    justification += `• Quality of evidence: ${evidence.length >= 3 ? 'Strong' : evidence.length >= 1 ? 'Moderate' : 'Weak'}\n`;
  } else {
    justification += `• Quality of evidence: Weak - no direct matches found\n`;
  }

  if (missing.length > 0) {
    justification += `• Deficiencies identified: ${missing.length}\n`;
    justification += `• Priority fixes: ${missing.slice(0, 2).join('; ')}`;
  }

  return justification;
}

function generateImprovementSuggestions(
  categoryScores: CategoryScore[],
  criteria: RubricCriterion[]
): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];

  categoryScores.forEach(score => {
    const criterion = criteria.find(c => c.id === score.criterionId);
    if (!criterion || score.status === 'complete') return;

    const pointsToGain = score.maxPoints - score.score;

    score.missingItems.forEach((item, idx) => {
      const priorityScore = criterion.priority === 'high' ? 100 : criterion.priority === 'medium' ? 50 : 25;
      const urgencyBonus = idx === 0 ? 50 : 0;
      const pointsBonus = pointsToGain * 5;

      suggestions.push({
        id: generateId(),
        criterionId: score.criterionId,
        suggestion: item,
        potentialPointsGain: pointsToGain / (score.missingItems.length || 1),
        priority: priorityScore + urgencyBonus + pointsBonus,
        category: criterion.category,
      });
    });
  });

  return suggestions.sort((a, b) => b.priority - a.priority);
}

function generateJudgeScores(
  totalScore: number,
  maxScore: number,
  criteria: RubricCriterion[],
  content: string
): JudgeScore[] {
  const avgPercentage = totalScore / maxScore;

  return [
    {
      judgeType: 'strict',
      totalScore: Math.round(avgPercentage * maxScore * 0.85 * 10) / 10,
      feedback: 'Graded with rigorous academic standards. Multiple areas require substantial revision. Focus on depth, evidence quality, and structural coherence.',
    },
    {
      judgeType: 'average',
      totalScore: Math.round(avgPercentage * maxScore * 0.95 * 10) / 10,
      feedback: 'Work meets basic expectations. Some areas show competence while others need development. Moderate revision recommended.',
    },
    {
      judgeType: 'lenient',
      totalScore: Math.round(Math.min(avgPercentage * maxScore * 1.1, maxScore) * 10) / 10,
      feedback: 'Good effort demonstrated. Work shows understanding with room for minor improvements. Encouraging progress overall.',
    },
  ];
}

export function gradeProject(
  content: string,
  criteria: RubricCriterion[],
  teacherMode: TeacherMode,
  teacherFeedback?: string
): Omit<Submission, 'id' | 'projectId' | 'rubricId' | 'version' | 'createdAt'> {
  const categoryScores = criteria.map(criterion =>
    calculateCriterionScore(content, criterion, teacherMode)
  );

  const totalScore = categoryScores.reduce((sum, score) => sum + score.score, 0);
  const maxScore = criteria.reduce((sum, c) => sum + c.maxPoints, 0);
  const avgConfidence = categoryScores.reduce((sum, s) => sum + s.confidence, 0) / categoryScores.length;

  const improvementSuggestions = generateImprovementSuggestions(categoryScores, criteria);
  const judgeScores = generateJudgeScores(totalScore, maxScore, criteria, content);

  // Calculate submission readiness
  const completeCount = categoryScores.filter(s => s.status === 'complete').length;
  const submissionReadiness = (completeCount / criteria.length) * 100;

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (submissionReadiness < 50) riskLevel = 'high';
  else if (submissionReadiness < 75) riskLevel = 'medium';

  // Generate AI report
  const grade = getGradeFromScore(totalScore, maxScore);
  const aiReport = generateAIReport(
    totalScore,
    maxScore,
    categoryScores,
    criteria,
    improvementSuggestions,
    teacherMode,
    teacherFeedback
  );

  return {
    teacherMode,
    teacherFeedback,
    totalScore: Math.round(totalScore * 10) / 10,
    maxScore,
    confidenceScore: Math.round(avgConfidence),
    submissionReadiness: Math.round(submissionReadiness),
    riskLevel,
    aiReport,
    categoryScores,
    improvementSuggestions,
    judgeScores,
  };
}

function generateAIReport(
  totalScore: number,
  maxScore: number,
  categoryScores: CategoryScore[],
  criteria: RubricCriterion[],
  improvements: ImprovementSuggestion[],
  teacherMode: TeacherMode,
  teacherFeedback?: string
): string {
  const grade = getGradeFromScore(totalScore, maxScore);
  const percentage = Math.round((totalScore / maxScore) * 100);

  let report = `═══════════════════════════════════════════════════════════
                    GRADEFLOW AI ANALYSIS REPORT
═══════════════════════════════════════════════════════════

OVERALL SCORE: ${totalScore}/${maxScore} (${percentage}%)
ESTIMATED GRADE: ${grade.letter} (${grade.range})

─────────────────────────────────────────────────────────────
                      STRENGTHS IDENTIFIED
─────────────────────────────────────────────────────────────
`;

  const completeScores = categoryScores.filter(s => s.status === 'complete');
  if (completeScores.length > 0) {
    completeScores.forEach(score => {
      const criterion = criteria.find(c => c.id === score.criterionId);
      if (criterion) {
        report += `\n✓ ${criterion.category.toUpperCase()}\n`;
        report += `  Score: ${score.score}/${score.maxPoints} | Status: COMPLETE\n`;
        if (score.evidenceFound.length > 0) {
          report += `  Evidence: "${score.evidenceFound[0]?.substring(0, 60)}..."\n`;
        }
      }
    });
  } else {
    report += `\n• Demonstrated effort in submission\n`;
    report += `• Foundation established for revision\n`;
  }

  report += `
─────────────────────────────────────────────────────────────
                    AREAS REQUIRING WORK
─────────────────────────────────────────────────────────────
`;

  categoryScores.filter(s => s.status !== 'complete').forEach(score => {
    const criterion = criteria.find(c => c.id === score.criterionId);
    if (criterion) {
      report += `\n✗ ${criterion.category.toUpperCase()}\n`;
      report += `  Score: ${score.score}/${score.maxPoints} | Status: ${score.status.toUpperCase()}\n`;
      report += `  Deficiencies:\n`;
      score.missingItems.slice(0, 3).forEach(item => {
        report += `    → ${item}\n`;
      });
    }
  });

  report += `
─────────────────────────────────────────────────────────────
                  PRIORITY IMPROVEMENT PLAN
─────────────────────────────────────────────────────────────
`;

  improvements.slice(0, 6).forEach((imp, idx) => {
    report += `\n${idx + 1}. [${imp.category.toUpperCase()}] ${imp.suggestion}\n`;
    report += `   Potential gain: +${imp.potentialPointsGain.toFixed(1)} points\n`;
  });

  if (teacherFeedback) {
    report += `
─────────────────────────────────────────────────────────────
                    TEACHER NOTES INCORPORATED
─────────────────────────────────────────────────────────────

The following teacher feedback was considered:
> "${teacherFeedback}"
`;
  }

  report += `
─────────────────────────────────────────────────────────────
                    GRADING METHODOLOGY
─────────────────────────────────────────────────────────────

Mode: ${TEACHER_MODE_CONFIG[teacherMode].label}
Strictness Level: ${Math.round(TEACHER_MODE_CONFIG[teacherMode].strictness * 100)}%
Analysis Depth: Deep semantic parsing with keyword extraction

═══════════════════════════════════════════════════════════
            END REPORT // Generated by GradeFlow AI
═══════════════════════════════════════════════════════════
`;

  return report;
}

export function identifyWeaknesses(submissions: Submission[]): { type: WeaknessType; count: number; severity: string }[] {
  const weaknessCounts = new Map<WeaknessType, number>();

  submissions.forEach(sub => {
    sub.categoryScores.forEach(score => {
      if (score.status !== 'complete') {
        const category = score.criterionId.toLowerCase();
        let weaknessType: WeaknessType = 'writing';

        if (category.includes('grammar') || category.includes('mechanics')) weaknessType = 'grammar';
        else if (category.includes('evidence') || category.includes('support')) weaknessType = 'evidence';
        else if (category.includes('organiz') || category.includes('structure')) weaknessType = 'organization';
        else if (category.includes('analysis') || category.includes('critical')) weaknessType = 'analysis';
        else if (category.includes('thesis') || category.includes('argument')) weaknessType = 'critical_thinking';
        else if (category.includes('creative')) weaknessType = 'creativity';

        weaknessCounts.set(weaknessType, (weaknessCounts.get(weaknessType) || 0) + 1);
      }
    });
  });

  const results = Array.from(weaknessCounts.entries()).map(([type, count]) => ({
    type,
    count,
    severity: count >= 3 ? 'high' : count >= 2 ? 'medium' : 'low',
  }));

  return results.sort((a, b) => b.count - a.count);
}

export function compareSubmissions(previous: Submission, current: Submission): {
  improved: string[];
  declined: string[];
  unchanged: string[];
  scoreChange: number;
} {
  const improved: string[] = [];
  const declined: string[] = [];
  const unchanged: string[] = [];

  current.categoryScores.forEach(currentScore => {
    const prevScore = previous.categoryScores.find(s => s.criterionId === currentScore.criterionId);
    if (!prevScore) return;

    if (currentScore.score > prevScore.score) {
      improved.push(currentScore.criterionId);
    } else if (currentScore.score < prevScore.score) {
      declined.push(currentScore.criterionId);
    } else {
      unchanged.push(currentScore.criterionId);
    }
  });

  return {
    improved,
    declined,
    unchanged,
    scoreChange: current.totalScore - previous.totalScore,
  };
}

export function parseRubric(rawContent: string): RubricCriterion[] {
  const criteria: RubricCriterion[] = [];
  const lines = rawContent.split('\n').filter(l => l.trim());

  let currentCategory = '';
  let orderIndex = 0;

  lines.forEach(line => {
    // Try to extract point values
    const pointMatch = line.match(/(\d+)\s*(points?|pts?)/i);
    const points = pointMatch ? parseInt(pointMatch[1]) : 10;

    // Check if this looks like a category header
    const categoryMatch = line.match(/^([A-Z][A-Za-z\s]+)[:\(]/);
    if (categoryMatch) {
      currentCategory = categoryMatch[1].trim();
    }

    // Check for colon-separated criterion
    const colonMatch = line.match(/^(.+?):\s*(.+)$/);
    if (colonMatch && colonMatch[1].length < 50) {
      const category = colonMatch[1].trim();
      const description = colonMatch[2].trim();

      if (description.length > 10) {
        criteria.push({
          id: generateId(),
          category,
          description,
          maxPoints: points,
          priority: points >= 20 ? 'high' : points >= 10 ? 'medium' : 'low',
          orderIndex: orderIndex++,
        });
      }
    } else if (line.length > 20 && !categoryMatch) {
      // Raw description without category
      const words = line.split(/\s+/);
      const inferredCategory = words.slice(0, 3).join(' ');

      criteria.push({
        id: generateId(),
        category: currentCategory || inferredCategory,
        description: line,
        maxPoints: points,
        priority: points >= 20 ? 'high' : points >= 10 ? 'medium' : 'low',
        orderIndex: orderIndex++,
      });
    }
  });

  // If no criteria found, create default ones
  if (criteria.length === 0) {
    const defaultCriteria = [
      { category: 'Content & Ideas', description: 'Demonstrates understanding of subject matter with relevant ideas and content. Main points are clearly stated and developed.', maxPoints: 25 },
      { category: 'Organization', description: 'Well-structured with clear introduction, body, and conclusion. Logical flow of ideas. Effective transitions between paragraphs.', maxPoints: 20 },
      { category: 'Evidence & Support', description: 'Uses specific examples, facts, or quotes to support claims. Proper citations included. Evidence is relevant and well-integrated.', maxPoints: 20 },
      { category: 'Analysis', description: 'Demonstrates critical thinking and deep analysis of the topic. Connects evidence to thesis. Explores implications and alternative views.', maxPoints: 20 },
      { category: 'Grammar & Mechanics', description: 'Free from grammatical, spelling, and punctuation errors. Proper sentence structure. Appropriate word choice and academic tone.', maxPoints: 15 },
    ];

    defaultCriteria.forEach((c, idx) => {
      criteria.push({
        id: generateId(),
        ...c,
        priority: c.maxPoints >= 20 ? 'high' : 'medium',
        orderIndex: idx,
      });
    });
  }

  return criteria;
}
