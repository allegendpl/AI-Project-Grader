// GradeFlow - AP CSP Style JavaScript

// GLOBAL VARIABLES
let projectData = {
  name: '',
  content: '',
  rubric: [],
  scores: null
};

let currentTab = 'upload';
let selectedTeacherMode = 'high';

// DOM ELEMENTS 
const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.section');
const projectFileInput = document.getElementById('projectFile');
const rubricInput = document.getElementById('rubricInput');
const projectNameInput = document.getElementById('projectName');
const startBtn = document.getElementById('startBtn');
const projectStatus = document.getElementById('projectStatus');
const rubricStatus = document.getElementById('rubricStatus');

// TAB NAVIGATION
function switchTab(tabName) {
  // Update tabs
  tabs.forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.tab === tabName) {
      tab.classList.add('active');
    }
  });

  // Update sections
  sections.forEach(section => {
    section.classList.remove('active');
    if (section.id === tabName) {
      section.classList.add('active');
    }
  });

  currentTab = tabName;
}

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    switchTab(tab.dataset.tab);
  });
});

// FILE UPLOAD
let uploadedFiles = [];

projectFileInput.addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  uploadedFiles = [];

  files.forEach(file => {
    const reader = new FileReader();
    reader.onload = (event) => {
      uploadedFiles.push({
        name: file.name,
        content: event.target.result
      });
      updateProjectFileList();
      validateForm();
    };
    reader.readAsText(file);
  });
});

function updateProjectFileList() {
  const fileList = document.getElementById('projectFileList');
  fileList.innerHTML = '';

  uploadedFiles.forEach((file, index) => {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
      <span>📄 ${file.name}</span>
      <button onclick="removeFile(${index})">✕</button>
    `;
    fileList.appendChild(fileItem);
  });
}

function removeFile(index) {
  uploadedFiles.splice(index, 1);
  updateProjectFileList();
  validateForm();
}

//  FORM VALIDATION 
function validateForm() {
  const hasProject = uploadedFiles.length > 0;
  const hasRubric = rubricInput.value.trim().length > 20;

  // Update project status
  if (hasProject) {
    projectStatus.className = 'status-box success';
    projectStatus.innerHTML = '<span class="status-icon"></span><span>Project Uploaded</span>';
  } else {
    projectStatus.className = 'status-box';
    projectStatus.innerHTML = '<span class="status-icon"></span><span>Project Required</span>';
  }

  // Update rubric status
  if (hasRubric) {
    rubricStatus.className = 'status-box success';
    rubricStatus.innerHTML = '<span class="status-icon"></span><span>Rubric Provided</span>';
  } else {
    rubricStatus.className = 'status-box';
    rubricStatus.innerHTML = '<span class="status-icon"></span><span>Rubric Required</span>';
  }

  // Enable/disable button
  startBtn.disabled = !(hasProject && hasRubric);
}

rubricInput.addEventListener('input', validateForm);
projectNameInput.addEventListener('input', validateForm);

//  PARSE RUBRIC
function parseRubric(text) {
  const rubric = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (line.length < 5) continue;

    // Try to find point values
    let points = 10;
    const pointMatch = line.match(/(\d+)\s*(points?|pts?)/i);
    if (pointMatch) {
      points = parseInt(pointMatch[1]);
    }

    // Find category and description
    let category = '';
    let description = '';

    const colonIndex = line.indexOf(':');
    if (colonIndex > 0 && colonIndex < 50) {
      category = line.substring(0, colonIndex).trim();
      description = line.substring(colonIndex + 1).trim();
    } else {
      const words = line.split(' ').slice(0, 3);
      category = words.join(' ');
      description = line;
    }

    if (description.length > 5) {
      rubric.push({
        category: category,
        description: description,
        maxPoints: points
      });
    }
  }

  // If no rubric found, create default
  if (rubric.length === 0) {
    rubric.push(
      { category: 'Content & Ideas', description: 'Demonstrates understanding with relevant ideas', maxPoints: 25 },
      { category: 'Organization', description: 'Well-structured with clear flow', maxPoints: 20 },
      { category: 'Evidence & Support', description: 'Uses specific examples and details', maxPoints: 20 },
      { category: 'Analysis', description: 'Shows critical thinking and depth', maxPoints: 20 },
      { category: 'Grammar & Mechanics', description: 'Free from errors, proper writing', maxPoints: 15 }
    );
  }

  return rubric;
}

// DISPLAY RUBRIC
function displayRubric() {
  const rubricText = rubricInput.value;
  projectData.rubric = parseRubric(rubricText);
  projectData.name = projectNameInput.value || 'My Project';
  projectData.content = uploadedFiles.map(f => f.content).join('\n\n');

  const rubricList = document.getElementById('rubricList');
  rubricList.innerHTML = '<h3>Grading Criteria:</h3>';

  projectData.rubric.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'rubric-item';
    div.innerHTML = `
      <h4>${index + 1}. ${item.category}</h4>
      <p>${item.description}</p>
      <span class="points-badge">${item.maxPoints} points</span>
    `;
    rubricList.appendChild(div);
  });

  switchTab('rubric');
}

startBtn.addEventListener('click', displayRubric);

document.getElementById('toGradingBtn').addEventListener('click', () => {
  switchTab('grading');
});

// TEACHER MODE SELECTION
const modeButtons = document.querySelectorAll('.mode-btn');
modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    selectedTeacherMode = btn.dataset.mode;
  });
});

//  GRADING LOGIC 
function calculateScore(content, criterion) {
  // Simple keyword matching algorithm
  const keywords = criterion.description.toLowerCase().split(' ')
    .filter(word => word.length > 4);
  const contentLower = content.toLowerCase();

  let matches = 0;
  keywords.forEach(keyword => {
    if (contentLower.includes(keyword)) {
      matches++;
    }
  });

  const ratio = keywords.length > 0 ? matches / keywords.length : 0.5;
  let score = criterion.maxPoints * ratio;

  // Apply teacher mode strictness
  if (selectedTeacherMode === 'elementary') {
    score *= 1.2; // More lenient
  } else if (selectedTeacherMode === 'middle') {
    score *= 1.0;
  } else {
    score *= 0.9; // More strict
  }

  // Add random variation
  score += (Math.random() - 0.5) * 2;

  // Clamp score
  score = Math.max(0, Math.min(criterion.maxPoints, score));

  return Math.round(score * 10) / 10;
}

function generateFeedback(criterion, score, maxPoints) {
  const percentage = (score / maxPoints) * 100;

  if (percentage >= 90) {
    return `Great work on ${criterion.category}! You fully met the requirements.`;
  } else if (percentage >= 70) {
    return `Good effort on ${criterion.category}. Add more details to improve.`;
  } else if (percentage >= 50) {
    return `${criterion.category} needs more work. Review the rubric requirements.`;
  } else {
    return `${criterion.category} is missing key elements. Study the rubric carefully.`;
  }
}

function analyzeProject() {
  const loading = document.getElementById('loadingIndicator');
  loading.classList.remove('hidden');

  // Simulate processing delay
  setTimeout(() => {
    const categoryScores = [];
    let totalScore = 0;
    let maxScore = 0;

    projectData.rubric.forEach(criterion => {
      const score = calculateScore(projectData.content, criterion);
      const feedback = generateFeedback(criterion, score, criterion.maxPoints);

      categoryScores.push({
        category: criterion.category,
        description: criterion.description,
        score: score,
        maxPoints: criterion.maxPoints,
        feedback: feedback
      });

      totalScore += score;
      maxScore += criterion.maxPoints;
    });

    const percentage = Math.round((totalScore / maxScore) * 100);

    projectData.scores = {
      totalScore: totalScore,
      maxScore: maxScore,
      percentage: percentage,
      categoryScores: categoryScores,
      confidence: Math.round(60 + Math.random() * 35),
      readiness: Math.round(categoryScores.filter(s => s.score / s.maxPoints >= 0.9).length / categoryScores.length * 100),
      risk: percentage < 60 ? 'HIGH' : percentage < 75 ? 'MEDIUM' : 'LOW'
    };

    displayReport();
    loading.classList.add('hidden');
  }, 1500);
}

document.getElementById('analyzeBtn').addEventListener('click', analyzeProject);

//DISPLAY REPORT 
function getGrade(percentage) {
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 63) return 'D';
  if (percentage >= 60) return 'D-';
  return 'F';
}

function displayReport() {
  const scores = projectData.scores;

  // Update score circle
  document.getElementById('scorePercent').textContent = scores.percentage + '%';
  document.getElementById('scoreGrade').textContent = getGrade(scores.percentage);

  // Update stats
  document.getElementById('statScore').textContent = scores.totalScore + '/' + scores.maxScore;
  document.getElementById('statConfidence').textContent = scores.confidence + '%';
  document.getElementById('statReadiness').textContent = scores.readiness + '%';
  document.getElementById('statRisk').textContent = scores.risk;
  document.getElementById('statRisk').style.color = scores.risk === 'LOW' ? '#00ff88' : scores.risk === 'MEDIUM' ? '#fbbf24' : '#ff4444';

  // Display category scores
  const categoryScoresDiv = document.getElementById('categoryScores');
  categoryScoresDiv.innerHTML = '';

  scores.categoryScores.forEach((item, index) => {
    const percentage = Math.round((item.score / item.maxPoints) * 100);
    const div = document.createElement('div');
    div.className = 'category-score';
    div.innerHTML = `
      <h4>${item.category} <span class="score-text">${item.score}/${item.maxPoints}</span></h4>
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="feedback">${item.feedback}</div>
    `;
    categoryScoresDiv.appendChild(div);
  });

  // Display improvement suggestions
  const improvementsDiv = document.getElementById('improvementsList');
  improvementsDiv.innerHTML = '';

  scores.categoryScores
    .filter(s => s.score < s.maxPoints)
    .sort((a, b) => (b.maxPoints - b.score) - (a.maxPoints - a.score))
    .forEach((item, index) => {
      const pointsToGain = item.maxPoints - item.score;
      const div = document.createElement('div');
      div.className = 'improvement-item';
      div.innerHTML = `
        <span>${index + 1}. Improve <strong>${item.category}</strong></span>
        <span class="points">+${pointsToGain.toFixed(1)} pts</span>
      `;
      improvementsDiv.appendChild(div);
    });

  if (improvementsDiv.innerHTML === '') {
    improvementsDiv.innerHTML = '<p style="color: #00ff88;">Great job! All criteria met!</p>';
  }

  switchTab('report');
}

// ========== COLLAPSIBLE SECTIONS ==========
document.querySelectorAll('.collapsible-header').forEach(header => {
  header.addEventListener('click', () => {
    const content = header.nextElementSibling;
    const arrow = header.querySelector('.arrow');

    if (content.style.display === 'block') {
      content.style.display = 'none';
      arrow.textContent = '▶';
    } else {
      content.style.display = 'block';
      arrow.textContent = '▼';
    }
  });
});

// ========== NEW REVISION ==========
document.getElementById('newRevisionBtn').addEventListener('click', () => {
  // Reset for new revision
  switchTab('upload');
});

// ========== AI CHAT ==========
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');
const quickBtns = document.querySelectorAll('.quick-btn');

function addMessage(text, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message ' + (isUser ? 'user' : 'bot');
  messageDiv.innerHTML = '<div class="message-content">' + text + '</div>';
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getSimpleAIResponse(question) {
  const questionLower = question.toLowerCase();
  const scores = projectData.scores;

  if (!scores) {
    return 'Please upload and analyze your project first, then I can help you!';
  }

  if (questionLower.includes('lowest') || questionLower.includes('worst') || questionLower.includes('weakest')) {
    const lowest = scores.categoryScores.reduce((min, s) =>
      s.score < min.score ? s : min
    );
    return `Your lowest area is <strong>${lowest.category}</strong> with ${lowest.score}/${lowest.maxPoints} points. ${lowest.feedback}`;
  }

  if (questionLower.includes('improve') || questionLower.includes('better')) {
    const needsWork = scores.categoryScores.filter(s => s.score < s.maxPoints);
    if (needsWork.length === 0) {
      return 'Great job! You\'ve met all criteria. Focus on maintaining this quality!';
    }
    const top = needsWork.sort((a, b) => (b.maxPoints - b.score) - (a.maxPoints - a.score))[0];
    return `Focus on improving <strong>${top.category}</strong>. You can gain +${(top.maxPoints - top.score).toFixed(1)} points there.`;
  }

  if (questionLower.includes('score') || questionLower.includes('explain')) {
    return `Your overall score is <strong>${scores.percentage}%</strong> (${scores.totalScore}/${scores.maxScore} points). You have ${scores.categoryScores.filter(s => s.score >= s.maxPoints * 0.9).length} criteria fully met.`;
  }

  if (questionLower.includes('grade')) {
    return `Based on your score of ${scores.percentage}%, your grade is approximately <strong>${getGrade(scores.percentage)}</strong>.`;
  }

  if (questionLower.includes('risk')) {
    return `Your submission risk is <strong>${scores.risk}</strong>. ${scores.readiness}% of criteria are complete.`;
  }

  return `I can help you understand your project scores! Your current score is ${scores.percentage}%. Ask me about your lowest area, how to improve, or your overall grade.`;
}

function sendMessage() {
  const question = chatInput.value.trim();
  if (!question) return;

  addMessage(question, true);
  chatInput.value = '';

  setTimeout(() => {
    const response = getSimpleAIResponse(question);
    addMessage(response, false);
  }, 500);
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') sendMessage();
});

quickBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    chatInput.value = btn.dataset.question;
    sendMessage();
  });
});

// ========== INITIALIZE ==========
validateForm();
