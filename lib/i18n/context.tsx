'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'bn';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    // Load language from localStorage
    const saved = localStorage.getItem('edulytics_ui_lang');
    if (saved === 'en' || saved === 'bn') {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('edulytics_ui_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Sidebar
    'sidebar.dashboard': 'Dashboard',
    'sidebar.questionBank': 'Question Bank',
    'sidebar.questionEditor': 'Question Editor',
    'sidebar.aiGenerator': 'AI Generator',
    'sidebar.solutionsHints': 'Solutions & Hints',
    'sidebar.paperBuilder': 'Paper Builder',
    'sidebar.sources': 'Sources',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your question bank and curriculum',
    'dashboard.totalQuestions': 'TOTAL QUESTIONS',
    'dashboard.withSolutions': 'WITH SOLUTIONS',
    'dashboard.totalSources': 'TOTAL SOURCES',
    'dashboard.topicsIndexed': 'TOPICS INDEXED',
    'dashboard.languages': 'LANGUAGES',
    'dashboard.curriculumStructure': 'Curriculum Structure',
    'dashboard.countries': 'COUNTRIES',
    'dashboard.boards': 'BOARDS',
    'dashboard.versions': 'VERSIONS',
    'dashboard.classes': 'CLASSES',
    'dashboard.groups': 'GROUPS',
    'dashboard.subjects': 'SUBJECTS',
    'dashboard.chapters': 'CHAPTERS',
    'dashboard.topics': 'TOPICS',
    'dashboard.questionsByType': 'Questions by Type',
    'dashboard.questionsByCurriculum': 'Questions by Curriculum',
    'dashboard.solutionsOverview': 'Solutions Overview',
    'dashboard.sourcesByType': 'Sources by Type',
    'dashboard.recentQuestions': 'Recent Questions',
    'dashboard.viewDetails': 'View Details',
    'dashboard.marks': 'Marks',
    'dashboard.options': 'Options',
    'dashboard.groupBy': 'Group by',
    'dashboard.board': 'Board',
    'dashboard.version': 'Version',
    'dashboard.level': 'Level',
    'dashboard.group': 'Group',
    'dashboard.subject': 'Subject',
    'dashboard.chapter': 'Chapter',
    'dashboard.type': 'Type',
    'dashboard.language': 'Language',
    'dashboard.stacked': 'Stacked',
    'dashboard.withSolution': 'With Solution',
    'dashboard.withoutSolution': 'Without Solution',
    'dashboard.withMedia': 'With Media',
    'dashboard.noSourceData': 'No source data available',
    
    // Question Bank
    'questionBank.title': 'Question Bank',
    'questionBank.subtitle': 'View and manage all questions offered across the school',
    'questionBank.addQuestion': 'Add Question',
    'questionBank.results': 'results',
    'questionBank.noQuestions': 'No questions found',
    
    // Paper Builder
    'paperBuilder.title': 'Create Exam Paper',
    'paperBuilder.subtitle': 'Follow the steps below',
    'paperBuilder.step1': 'What to Create?',
    'paperBuilder.step2': 'Class & Subject',
    'paperBuilder.step3': 'Chapters',
    'paperBuilder.step4': 'Questions & Time',
    'paperBuilder.examPaper': 'Exam Paper',
    'paperBuilder.examPaperDesc': 'With school name, time, full marks',
    'paperBuilder.assignment': 'Assignment',
    'paperBuilder.assignmentDesc': 'Title, instructions, due date',
    'paperBuilder.paperTitle': 'Paper Title',
    'paperBuilder.paperTitlePlaceholder': 'e.g. Mid-term Exam 2024',
    'paperBuilder.schoolName': 'School Name',
    'paperBuilder.schoolPlaceholder': 'e.g. Dhaka Model School',
    'paperBuilder.duration': 'Duration (minutes)',
    'paperBuilder.fullMarks': 'Full Marks',
    'paperBuilder.next': 'Next →',
    'paperBuilder.board': 'Board',
    'paperBuilder.selectBoard': 'Select Board',
    'paperBuilder.class': 'Class',
    'paperBuilder.selectClass': 'Select Class',
    'paperBuilder.group': 'Group',
    'paperBuilder.selectGroup': 'Select Group',
    'paperBuilder.subject': 'Subject',
    'paperBuilder.selectSubject': 'Select Subject',
    'paperBuilder.allChapters': 'All Chapters',
    'paperBuilder.sectionTitle': 'Section Title',
    'paperBuilder.questionType': 'Type',
    'paperBuilder.questionCount': 'Question Count',
    'paperBuilder.marksEach': 'Marks Each',
    'paperBuilder.answerCount': 'Answer Count',
    'paperBuilder.difficulty': 'Difficulty',
    'paperBuilder.mixed': 'Mixed',
    'paperBuilder.easy': 'Easy',
    'paperBuilder.medium': 'Medium',
    'paperBuilder.hard': 'Hard',
    'paperBuilder.addSection': 'Add Section',
    'paperBuilder.summary': 'Summary',
    'paperBuilder.totalQuestions': 'Total Questions:',
    'paperBuilder.totalMarks': 'Full Marks:',
    'paperBuilder.time': 'Time:',
    'paperBuilder.minutes': 'minutes',
    'paperBuilder.generated': 'Generated:',
    'paperBuilder.generatePaper': 'Generate Paper',
    'paperBuilder.regeneratePaper': 'Regenerate Paper',
    'paperBuilder.generating': 'Generating...',
    'paperBuilder.marksWarning': 'Total marks ({actual}) does not match target full marks ({target})',
    'paperBuilder.preview': 'Paper Preview',
    'paperBuilder.previewMessage': 'You will see the paper here after generation',
    'paperBuilder.editModeOn': 'Turn Off Edit Mode',
    'paperBuilder.editModeOff': 'Turn On Edit Mode',
    'paperBuilder.print': 'Print',
    'paperBuilder.downloadPdf': 'Download PDF',
    'paperBuilder.swap': 'Swap',
    'paperBuilder.reportError': 'Report Error',
    'paperBuilder.mcqSection': 'Multiple Choice Questions',
    'paperBuilder.cqSection': 'Creative Questions',
    'paperBuilder.sqSection': 'Short Questions',
    'paperBuilder.shortSection': 'Short Questions',
    'paperBuilder.longSection': 'Long Questions',
    
    // Filters
    'filters.board': 'Board',
    'filters.class': 'Class',
    'filters.group': 'Group',
    'filters.subject': 'Subject',
    'filters.chapter': 'Chapter',
    'filters.topic': 'Topic',
    'filters.type': 'Type',
    'filters.difficulty': 'Difficulty',
    'filters.language': 'Language',
    'filters.source': 'Source',
    'filters.hasSolution': 'Solution',
    'filters.hasMedia': 'Media',
    'filters.search': 'Search...',
    'filters.go': 'Go',
    
    // Common
    'common.developedBy': 'Developed by Edulytics',
    'common.welcome': 'Welcome back',
    'common.welcomeMessage': 'Here\'s what is happening at your school today',
  },
  bn: {
    // Sidebar
    'sidebar.dashboard': 'ড্যাশবোর্ড',
    'sidebar.questionBank': 'প্রশ্ন ব্যাংক',
    'sidebar.questionEditor': 'প্রশ্ন সম্পাদক',
    'sidebar.aiGenerator': 'AI জেনারেটর',
    'sidebar.solutionsHints': 'সমাধান ও ইঙ্গিত',
    'sidebar.paperBuilder': 'পেপার বিল্ডার',
    'sidebar.sources': 'উৎস',
    
    // Dashboard
    'dashboard.title': 'ড্যাশবোর্ড',
    'dashboard.subtitle': 'আপনার প্রশ্ন ব্যাংক এবং পাঠ্যক্রমের সংক্ষিপ্ত বিবরণ',
    'dashboard.totalQuestions': 'মোট প্রশ্ন',
    'dashboard.withSolutions': 'সমাধান সহ',
    'dashboard.totalSources': 'মোট উৎস',
    'dashboard.topicsIndexed': 'বিষয় সূচীবদ্ধ',
    'dashboard.languages': 'ভাষা',
    'dashboard.curriculumStructure': 'পাঠ্যক্রম কাঠামো',
    'dashboard.countries': 'দেশ',
    'dashboard.boards': 'বোর্ড',
    'dashboard.versions': 'সংস্করণ',
    'dashboard.classes': 'শ্রেণি',
    'dashboard.groups': 'গ্রুপ',
    'dashboard.subjects': 'বিষয়',
    'dashboard.chapters': 'অধ্যায়',
    'dashboard.topics': 'টপিক',
    'dashboard.questionsByType': 'ধরন অনুসারে প্রশ্ন',
    'dashboard.questionsByCurriculum': 'পাঠ্যক্রম অনুসারে প্রশ্ন',
    'dashboard.solutionsOverview': 'সমাধান সংক্ষিপ্ত বিবরণ',
    'dashboard.sourcesByType': 'ধরন অনুসারে উৎস',
    'dashboard.recentQuestions': 'সাম্প্রতিক প্রশ্ন',
    'dashboard.viewDetails': 'বিস্তারিত দেখুন',
    'dashboard.marks': 'নম্বর',
    'dashboard.options': 'অপশন',
    'dashboard.groupBy': 'গ্রুপ করুন',
    'dashboard.board': 'বোর্ড',
    'dashboard.version': 'সংস্করণ',
    'dashboard.level': 'স্তর',
    'dashboard.group': 'গ্রুপ',
    'dashboard.subject': 'বিষয়',
    'dashboard.chapter': 'অধ্যায়',
    'dashboard.type': 'ধরন',
    'dashboard.language': 'ভাষা',
    'dashboard.stacked': 'স্ট্যাক করা',
    'dashboard.withSolution': 'সমাধান সহ',
    'dashboard.withoutSolution': 'সমাধান ছাড়া',
    'dashboard.withMedia': 'মিডিয়া সহ',
    'dashboard.noSourceData': 'কোন উৎস ডেটা উপলব্ধ নেই',
    
    // Question Bank
    'questionBank.title': 'প্রশ্ন ব্যাংক',
    'questionBank.subtitle': 'স্কুল জুড়ে প্রদত্ত সমস্ত প্রশ্ন দেখুন এবং পরিচালনা করুন',
    'questionBank.addQuestion': 'প্রশ্ন যোগ করুন',
    'questionBank.results': 'ফলাফল',
    'questionBank.noQuestions': 'কোন প্রশ্ন পাওয়া যায়নি',
    
    // Paper Builder
    'paperBuilder.title': 'পরীক্ষার প্রশ্নপত্র তৈরি করুন',
    'paperBuilder.subtitle': 'নিচের ধাপগুলি অনুসরণ করুন',
    'paperBuilder.step1': 'কী তৈরি করবেন?',
    'paperBuilder.step2': 'শ্রেণি ও বিষয়',
    'paperBuilder.step3': 'অধ্যায়',
    'paperBuilder.step4': 'প্রশ্ন ও সময়',
    'paperBuilder.examPaper': 'পরীক্ষার প্রশ্নপত্র',
    'paperBuilder.examPaperDesc': 'স্কুল নাম, সময়, পূর্ণমান সহ',
    'paperBuilder.assignment': 'অ্যাসাইনমেন্ট',
    'paperBuilder.assignmentDesc': 'শিরোনাম, নির্দেশনা, তারিখ',
    'paperBuilder.paperTitle': 'পরীক্ষার নাম',
    'paperBuilder.paperTitlePlaceholder': 'যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৪',
    'paperBuilder.schoolName': 'শিক্ষা প্রতিষ্ঠান',
    'paperBuilder.schoolPlaceholder': 'যেমন: ঢাকা আদর্শ স্কুল',
    'paperBuilder.duration': 'সময় (মিনিট)',
    'paperBuilder.fullMarks': 'পূর্ণমান',
    'paperBuilder.next': 'পরবর্তী →',
    'paperBuilder.board': 'বোর্ড',
    'paperBuilder.selectBoard': 'বোর্ড নির্বাচন করুন',
    'paperBuilder.class': 'শ্রেণি',
    'paperBuilder.selectClass': 'শ্রেণি নির্বাচন করুন',
    'paperBuilder.group': 'গ্রুপ',
    'paperBuilder.selectGroup': 'গ্রুপ নির্বাচন করুন',
    'paperBuilder.subject': 'বিষয়',
    'paperBuilder.selectSubject': 'বিষয় নির্বাচন করুন',
    'paperBuilder.allChapters': 'সব অধ্যায়',
    'paperBuilder.sectionTitle': 'সেকশন শিরোনাম',
    'paperBuilder.questionType': 'ধরন',
    'paperBuilder.questionCount': 'প্রশ্ন সংখ্যা',
    'paperBuilder.marksEach': 'প্রতিটি নম্বর',
    'paperBuilder.answerCount': 'উত্তর দিতে হবে',
    'paperBuilder.difficulty': 'অসুবিধা',
    'paperBuilder.mixed': 'মিশ্র',
    'paperBuilder.easy': 'সহজ',
    'paperBuilder.medium': 'মাঝারি',
    'paperBuilder.hard': 'কঠিন',
    'paperBuilder.addSection': 'সেকশন যোগ করুন',
    'paperBuilder.summary': 'সংক্ষিপ্ত বিবরণ',
    'paperBuilder.totalQuestions': 'মোট প্রশ্ন:',
    'paperBuilder.totalMarks': 'পূর্ণমান:',
    'paperBuilder.time': 'সময়:',
    'paperBuilder.minutes': 'মিনিট',
    'paperBuilder.generated': 'তৈরি হয়েছে:',
    'paperBuilder.generatePaper': 'প্রশ্নপত্র তৈরি করুন',
    'paperBuilder.regeneratePaper': 'নতুন করে তৈরি করুন',
    'paperBuilder.generating': 'তৈরি হচ্ছে...',
    'paperBuilder.marksWarning': 'মোট নম্বর ({actual}) লক্ষ্য পূর্ণমান ({target}) এর সাথে মিলছে না',
    'paperBuilder.preview': 'প্রশ্নপত্র প্রিভিউ',
    'paperBuilder.previewMessage': 'প্রশ্নপত্র তৈরি করার পর এখানে দেখতে পাবেন',
    'paperBuilder.editModeOn': 'এডিট মোড বন্ধ',
    'paperBuilder.editModeOff': 'এডিট মোড চালু',
    'paperBuilder.print': 'প্রিন্ট',
    'paperBuilder.downloadPdf': 'PDF ডাউনলোড',
    'paperBuilder.swap': 'বদলাও',
    'paperBuilder.reportError': 'ভুল রিপোর্ট করুন',
    'paperBuilder.mcqSection': 'বহুনির্বাচনি প্রশ্ন',
    'paperBuilder.cqSection': 'সৃজনশীল প্রশ্ন',
    'paperBuilder.sqSection': 'সংক্ষিপ্ত প্রশ্ন',
    'paperBuilder.shortSection': 'ছোট প্রশ্ন',
    'paperBuilder.longSection': 'বড় প্রশ্ন',
    
    // Filters
    'filters.board': 'বোর্ড',
    'filters.class': 'শ্রেণি',
    'filters.group': 'গ্রুপ',
    'filters.subject': 'বিষয়',
    'filters.chapter': 'অধ্যায়',
    'filters.topic': 'টপিক',
    'filters.type': 'ধরন',
    'filters.difficulty': 'অসুবিধা',
    'filters.language': 'ভাষা',
    'filters.source': 'উৎস',
    'filters.hasSolution': 'সমাধান',
    'filters.hasMedia': 'মিডিয়া',
    'filters.search': 'খুঁজুন...',
    'filters.go': 'যান',
    
    // Common
    'common.developedBy': 'ডেভেলপড বাই এডুলিটিক্স',
    'common.welcome': 'স্বাগতম',
    'common.welcomeMessage': 'আজ আপনার স্কুলে কী ঘটছে তা এখানে',
  },
};
