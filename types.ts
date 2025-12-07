export type ClassLevel = '9' | '10' | '11' | '12';

export interface CurriculumData {
  [key: string]: {
    [subject: string]: string[];
  };
}

export interface FormData {
  selectedClass: ClassLevel | '';
  selectedSubject: string;
  selectedChapter: string;
  customInstructions: string;
}

export interface MindMapResult {
  svg: string;
  markdown: string;
}