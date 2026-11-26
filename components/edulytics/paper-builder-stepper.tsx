'use client';

import { useState, useEffect } from 'react';
import { PaperConfig, PaperSection } from '@/app/paper-builder/page';
import { ContentCard } from './content-card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { ChevronDown, ChevronRight, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface StepperProps {
  config: PaperConfig;
  onChange: (config: PaperConfig) => void;
  onGenerate: () => void;
  generating: boolean;
  totalMarks: number;
  totalQuestions: number;
  generatedCount: number;
}

interface CurriculumNode {
  _id: string;
  name: string;
  nameBn?: string;
}

export function PaperBuilderStepper({
  config,
  onChange,
  onGenerate,
  generating,
  totalMarks,
  totalQuestions,
  generatedCount,
}: StepperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [boards, setBoards] = useState<CurriculumNode[]>([]);
  const [classes, setClasses] = useState<CurriculumNode[]>([]);
  const [groups, setGroups] = useState<CurriculumNode[]>([]);
  const [subjects, setSubjects] = useState<CurriculumNode[]>([]);
  const [chapters, setChapters] = useState<CurriculumNode[]>([]);

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (config.boardId) loadClasses(config.boardId);
  }, [config.boardId]);

  useEffect(() => {
    if (config.classId) loadGroups(config.classId);
  }, [config.classId]);

  useEffect(() => {
    if (config.groupId) loadSubjects(config.groupId);
  }, [config.groupId]);

  useEffect(() => {
    if (config.subjectId) loadChapters(config.subjectId);
  }, [config.subjectId]);

  const loadBoards = async () => {
    try {
      const res = await fetch('/api/curriculum/root');
      const data = await res.json();
      setBoards(data.boards || []);
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadClasses = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      setClasses(data.children || []);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadGroups = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      setGroups(data.children || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadSubjects = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      setSubjects(data.children || []);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadChapters = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      setChapters(data.children || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const addSection = () => {
    const newSection: PaperSection = {
      id: Date.now().toString(),
      title: 'নতুন সেকশন',
      type: 'mcq',
      questionsNeeded: 10,
      marksEach: 1,
      questions: [],
    };
    onChange({ ...config, sections: [...config.sections, newSection] });
  };

  const removeSection = (id: string) => {
    onChange({
      ...config,
      sections: config.sections.filter(s => s.id !== id),
    });
  };

  const updateSection = (id: string, updates: Partial<PaperSection>) => {
    onChange({
      ...config,
      sections: config.sections.map(s => s.id === id ? { ...s, ...updates } : s),
    });
  };

  const selectedBoard = boards.find(b => b._id === config.boardId);
  const selectedClass = classes.find(c => c._id === config.classId);
  const selectedSubject = subjects.find(s => s._id === config.subjectId);

  const step2Summary = selectedClass && selectedSubject
    ? `${selectedClass.nameBn || selectedClass.name} · ${selectedSubject.nameBn || selectedSubject.name}`
    : null;

  const step3Summary = config.chapterIds?.length
    ? `${config.chapterIds.length} অধ্যায় নির্বাচিত`
    : null;

  const isStep1Complete = config.paperTitle && config.paperType;
  const isStep2Complete = config.subjectId;
  const isStep3Complete = config.chapterIds && config.chapterIds.length > 0;
  const isStep4Complete = config.sections.length > 0;

  return (
    <div className="space-y-4 pb-6">
      <div className="sticky top-0 bg-white z-10 pb-4">
        <h2 className="text-lg font-bold text-edulytics-text font-bengali">
          পরীক্ষার প্রশ্নপত্র তৈরি করুন
        </h2>
        <p className="text-xs text-edulytics-muted">
          নিচের ধাপগুলি অনুসরণ করুন
        </p>
      </div>

      {/* Step 1: What to Create */}
      <Collapsible open={currentStep === 1} onOpenChange={(open) => open && setCurrentStep(1)}>
        <ContentCard className="border-2 border-edulytics-primary/20">
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isStep1Complete ? 'bg-edulytics-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                ১
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm text-edulytics-text font-bengali">
                  কী তৈরি করবেন?
                </div>
                {currentStep !== 1 && config.paperTitle && (
                  <div className="text-xs text-edulytics-muted font-bengali">
                    {config.paperTitle}
                  </div>
                )}
              </div>
              {currentStep === 1 ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onChange({ ...config, paperType: 'exam' })}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    config.paperType === 'exam'
                      ? 'border-edulytics-primary bg-edulytics-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1 font-bengali">পরীক্ষার প্রশ্নপত্র</div>
                  <div className="text-xs text-edulytics-muted font-bengali">
                    স্কুল নাম, সময়, পূর্ণমান সহ
                  </div>
                </button>
                <button
                  onClick={() => onChange({ ...config, paperType: 'assignment' })}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    config.paperType === 'assignment'
                      ? 'border-edulytics-primary bg-edulytics-primary-light'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-bold text-sm mb-1 font-bengali">অ্যাসাইনমেন্ট</div>
                  <div className="text-xs text-edulytics-muted font-bengali">
                    শিরোনাম, নির্দেশনা, তারিখ
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-edulytics-text font-bengali">
                  {config.paperType === 'exam' ? 'পরীক্ষার নাম' : 'অ্যাসাইনমেন্ট শিরোনাম'}
                </Label>
                <Input
                  value={config.paperTitle}
                  onChange={(e) => onChange({ ...config, paperTitle: e.target.value })}
                  placeholder="যেমন: অর্ধবার্ষিক পরীক্ষা ২০২৪"
                  className="h-9 font-bengali"
                />
              </div>

              {config.paperType === 'exam' && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-edulytics-text font-bengali">
                      শিক্ষা প্রতিষ্ঠান
                    </Label>
                    <Input
                      value={config.schoolName || ''}
                      onChange={(e) => onChange({ ...config, schoolName: e.target.value })}
                      placeholder="যেমন: ঢাকা আদর্শ স্কুল"
                      className="h-9 font-bengali"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-edulytics-text font-bengali">
                        সময় (মিনিট)
                      </Label>
                      <Input
                        type="number"
                        value={config.duration || ''}
                        onChange={(e) => onChange({ ...config, duration: parseInt(e.target.value) || undefined })}
                        placeholder="১৮০"
                        className="h-9 font-bengali"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-edulytics-text font-bengali">
                        পূর্ণমান
                      </Label>
                      <Input
                        type="number"
                        value={config.fullMarks || ''}
                        onChange={(e) => onChange({ ...config, fullMarks: parseInt(e.target.value) || undefined })}
                        placeholder="১০০"
                        className="h-9 font-bengali"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Complete}
                className="w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white font-bengali"
              >
                পরবর্তী →
              </Button>
            </div>
          </CollapsibleContent>
        </ContentCard>
      </Collapsible>

      {/* Step 2: Class & Subject */}
      <Collapsible open={currentStep === 2} onOpenChange={(open) => open && setCurrentStep(2)}>
        <ContentCard className={`border-2 ${currentStep === 2 ? 'border-edulytics-primary/20' : 'border-transparent'}`}>
          <CollapsibleTrigger className="w-full" disabled={!isStep1Complete}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isStep2Complete ? 'bg-edulytics-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                ২
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm text-edulytics-text font-bengali">
                  শ্রেণি ও বিষয়
                </div>
                {currentStep !== 2 && step2Summary && (
                  <div className="text-xs text-edulytics-muted font-bengali">
                    {step2Summary}
                  </div>
                )}
              </div>
              {currentStep === 2 ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-4 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-edulytics-text font-bengali">বোর্ড</Label>
                <Select value={config.boardId} onValueChange={(val) => onChange({ ...config, boardId: val || undefined, classId: undefined, groupId: undefined, subjectId: undefined })}>
                  <SelectTrigger className="h-9 font-bengali">
                    <SelectValue placeholder="বোর্ড নির্বাচন করুন" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map(board => (
                      <SelectItem key={board._id} value={board._id} className="font-bengali">
                        {board.nameBn || board.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {config.boardId && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-edulytics-text font-bengali">শ্রেণি</Label>
                  <Select value={config.classId} onValueChange={(val) => onChange({ ...config, classId: val || undefined, groupId: undefined, subjectId: undefined })}>
                    <SelectTrigger className="h-9 font-bengali">
                      <SelectValue placeholder="শ্রেণি নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(cls => (
                        <SelectItem key={cls._id} value={cls._id} className="font-bengali">
                          {cls.nameBn || cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.classId && groups.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-edulytics-text font-bengali">গ্রুপ</Label>
                  <Select value={config.groupId} onValueChange={(val) => onChange({ ...config, groupId: val || undefined, subjectId: undefined })}>
                    <SelectTrigger className="h-9 font-bengali">
                      <SelectValue placeholder="গ্রুপ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map(group => (
                        <SelectItem key={group._id} value={group._id} className="font-bengali">
                          {group.nameBn || group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {(config.groupId || (config.classId && groups.length === 0)) && (
                <div className="space-y-2">
                  <Label className="text-xs font-semibold text-edulytics-text font-bengali">বিষয়</Label>
                  <Select value={config.subjectId} onValueChange={(val) => onChange({ ...config, subjectId: val || undefined })}>
                    <SelectTrigger className="h-9 font-bengali">
                      <SelectValue placeholder="বিষয় নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map(subject => (
                        <SelectItem key={subject._id} value={subject._id} className="font-bengali">
                          {subject.nameBn || subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!isStep2Complete}
                className="w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white font-bengali"
              >
                পরবর্তী →
              </Button>
            </div>
          </CollapsibleContent>
        </ContentCard>
      </Collapsible>

      {/* Step 3: Chapters */}
      <Collapsible open={currentStep === 3} onOpenChange={(open) => open && setCurrentStep(3)}>
        <ContentCard className={`border-2 ${currentStep === 3 ? 'border-edulytics-primary/20' : 'border-transparent'}`}>
          <CollapsibleTrigger className="w-full" disabled={!isStep2Complete}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isStep3Complete ? 'bg-edulytics-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                ৩
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm text-edulytics-text font-bengali">
                  অধ্যায়
                </div>
                {currentStep !== 3 && step3Summary && (
                  <div className="text-xs text-edulytics-muted font-bengali">
                    {step3Summary}
                  </div>
                )}
              </div>
              {currentStep === 3 ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={config.chapterIds?.length === chapters.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      onChange({ ...config, chapterIds: chapters.map(c => c._id) });
                    } else {
                      onChange({ ...config, chapterIds: [] });
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label className="text-xs font-semibold text-edulytics-text font-bengali">
                  সব অধ্যায়
                </Label>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {chapters.map(chapter => {
                  const isSelected = config.chapterIds?.includes(chapter._id);
                  return (
                    <label
                      key={chapter._id}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'bg-edulytics-primary-light' : 'hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => {
                          const currentIds = config.chapterIds || [];
                          if (e.target.checked) {
                            onChange({ ...config, chapterIds: [...currentIds, chapter._id] });
                          } else {
                            onChange({ ...config, chapterIds: currentIds.filter(id => id !== chapter._id) });
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-bengali">{chapter.nameBn || chapter.name}</span>
                    </label>
                  );
                })}
              </div>

              <Button
                onClick={() => setCurrentStep(4)}
                disabled={!isStep3Complete}
                className="w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white font-bengali"
              >
                পরবর্তী →
              </Button>
            </div>
          </CollapsibleContent>
        </ContentCard>
      </Collapsible>

      {/* Step 4: Question Mix */}
      <Collapsible open={currentStep === 4} onOpenChange={(open) => open && setCurrentStep(4)}>
        <ContentCard className={`border-2 ${currentStep === 4 ? 'border-edulytics-primary/20' : 'border-transparent'}`}>
          <CollapsibleTrigger className="w-full" disabled={!isStep3Complete}>
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                isStep4Complete ? 'bg-edulytics-primary text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                ৪
              </div>
              <div className="flex-1 text-left">
                <div className="font-bold text-sm text-edulytics-text font-bengali">
                  প্রশ্ন ও সময়
                </div>
                {currentStep !== 4 && config.sections.length > 0 && (
                  <div className="text-xs text-edulytics-muted font-bengali">
                    {totalQuestions} প্রশ্ন · {totalMarks} নম্বর
                  </div>
                )}
              </div>
              {currentStep === 4 ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="mt-4 space-y-3">
              {config.sections.map((section) => (
                <div key={section.id} className="p-3 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex items-start gap-2">
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      className="h-8 text-sm font-bengali flex-1"
                      placeholder="সেকশন শিরোনাম"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSection(section.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-edulytics-muted font-bengali">ধরন</Label>
                      <Select value={section.type} onValueChange={(val: any) => updateSection(section.id, { type: val })}>
                        <SelectTrigger className="h-8 text-xs font-bengali">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq" className="font-bengali">বহুনির্বাচনি (MCQ)</SelectItem>
                          <SelectItem value="cq" className="font-bengali">সৃজনশীল (CQ)</SelectItem>
                          <SelectItem value="sq" className="font-bengali">সংক্ষিপ্ত (SQ)</SelectItem>
                          <SelectItem value="short" className="font-bengali">ছোট প্রশ্ন</SelectItem>
                          <SelectItem value="long" className="font-bengali">বড় প্রশ্ন</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-edulytics-muted font-bengali">প্রশ্ন সংখ্যা</Label>
                      <Input
                        type="number"
                        value={section.questionsNeeded}
                        onChange={(e) => updateSection(section.id, { questionsNeeded: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs font-bengali"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-edulytics-muted font-bengali">প্রতিটি নম্বর</Label>
                      <Input
                        type="number"
                        value={section.marksEach}
                        onChange={(e) => updateSection(section.id, { marksEach: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs font-bengali"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs text-edulytics-muted font-bengali">উত্তর দিতে হবে</Label>
                      <Input
                        type="number"
                        value={section.questionsToAnswer || section.questionsNeeded}
                        onChange={(e) => updateSection(section.id, { questionsToAnswer: parseInt(e.target.value) || undefined })}
                        className="h-8 text-xs font-bengali"
                        placeholder={String(section.questionsNeeded)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs text-edulytics-muted font-bengali">অসুবিধা</Label>
                    <Select value={section.difficulty || 'mixed'} onValueChange={(val: any) => updateSection(section.id, { difficulty: val })}>
                      <SelectTrigger className="h-8 text-xs font-bengali">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed" className="font-bengali">মিশ্র</SelectItem>
                        <SelectItem value="easy" className="font-bengali">সহজ</SelectItem>
                        <SelectItem value="medium" className="font-bengali">মাঝারি</SelectItem>
                        <SelectItem value="hard" className="font-bengali">কঠিন</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addSection}
                className="w-full border-edulytics-primary/30 text-edulytics-primary hover:bg-edulytics-primary-light font-bengali"
              >
                <Plus className="h-4 w-4 mr-2" />
                সেকশন যোগ করুন
              </Button>
            </div>
          </CollapsibleContent>
        </ContentCard>
      </Collapsible>

      {/* Summary Card */}
      {config.sections.length > 0 && (
        <ContentCard className="bg-gradient-to-br from-edulytics-primary/10 to-purple-100/50 border-2 border-edulytics-primary/30">
          <div className="space-y-3">
            <div className="font-bold text-sm text-edulytics-text font-bengali">
              সংক্ষিপ্ত বিবরণ
            </div>

            <div className="space-y-2 text-sm font-bengali">
              <div className="flex justify-between">
                <span className="text-edulytics-muted">মোট প্রশ্ন:</span>
                <span className="font-semibold">{totalQuestions}টি</span>
              </div>
              <div className="flex justify-between">
                <span className="text-edulytics-muted">পূর্ণমান:</span>
                <span className="font-semibold">{totalMarks}</span>
              </div>
              {config.duration && (
                <div className="flex justify-between">
                  <span className="text-edulytics-muted">সময়:</span>
                  <span className="font-semibold">{config.duration} মিনিট</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-edulytics-muted">তৈরি হয়েছে:</span>
                <span className="font-semibold">
                  {generatedCount}/{totalQuestions}
                </span>
              </div>
            </div>

            {config.fullMarks && totalMarks !== config.fullMarks && (
              <div className="flex items-start gap-2 p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-yellow-700 font-bengali">
                  মোট নম্বর ({totalMarks}) লক্ষ্য পূর্ণমান ({config.fullMarks}) এর সাথে মিলছে না
                </div>
              </div>
            )}

            <Button
              onClick={onGenerate}
              disabled={generating || !isStep4Complete}
              className="w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white font-bengali"
            >
              {generating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  তৈরি হচ্ছে...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generatedCount > 0 ? 'নতুন করে তৈরি করুন' : 'প্রশ্নপত্র তৈরি করুন'}
                </>
              )}
            </Button>
          </div>
        </ContentCard>
      )}
    </div>
  );
}
