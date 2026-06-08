import { ProjectType } from '../types';

export async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target?.result as string;
      resolve(content);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    if (file.name.endsWith('.pdf')) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  });
}

export function detectProjectType(file: File): ProjectType {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const name = file.name.toLowerCase();

  if (['doc', 'docx', 'pdf', 'txt'].includes(extension)) {
    if (name.includes('essay') || name.includes('paper') || name.includes('report')) {
      return 'essay';
    }
    return 'essay';
  }

  if (['ppt', 'pptx'].includes(extension)) {
    return 'slides';
  }

  if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'rb', 'php'].includes(extension)) {
    return 'code';
  }

  if (['mp4', 'mov', 'avi', 'webm'].includes(extension)) {
    return 'video';
  }

  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
    return 'audio';
  }

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
    return 'image';
  }

  return 'essay';
}

export function getFileExtensionIcon(extension: string): string {
  const ext = extension.toLowerCase();

  if (['pdf'].includes(ext)) return 'FileText';
  if (['doc', 'docx'].includes(ext)) return 'FileText';
  if (['ppt', 'pptx'].includes(ext)) return 'Presentation';
  if (['xls', 'xlsx'].includes(ext)) return 'FileSpreadsheet';
  if (['zip', 'rar', '7z'].includes(ext)) return 'FileArchive';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'Image';
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'Video';
  if (['mp3', 'wav'].includes(ext)) return 'Music';
  if (['js', 'ts', 'py', 'java', 'cpp'].includes(ext)) return 'Code';

  return 'File';
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || singular + 's');
}
