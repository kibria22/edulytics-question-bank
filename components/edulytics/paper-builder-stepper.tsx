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
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

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
  const { t, language } = useI18n();
  const [currentStep, setCurrentStep] = useState(1);
  const [boards, setBoards] = useState<CurriculumNode[]>([]);
  const [versions, setVersions] = useState<CurriculumNode[]>([]);
  const [classes, setClasses] = useState<CurriculumNode[]>([]);
  const [groups, setGroups] = useState<CurriculumNode[]>([]);
  const [subjects, setSubjects] = useState<CurriculumNode[]>([]);
  const [chapters, setChapters] = useState<CurriculumNode[]>([]);

  useEffect(() => {
    loadBoards();
  }, []);

  useEffect(() => {
    if (config.boardId) loadVersions(config.boardId);
  }, [config.boardId]);

  useEffect(() => {
    if (config.versionId) loadClasses(config.versionId);
  }, [config.versionId]);

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
      // Get country node first
      if (data.nodes && data.nodes.length > 0) {
        const countryId = data.nodes[0]._id;
        // Load boards as children of country
        const boardRes = await fetch(`/api/curriculum/children?parentId=${countryId}`);
        const boardData = await boardRes.json();
        const boardNodes = (boardData.nodes || []).map((node: any) => ({
          _id: node._id,
          name: node.name.en,
          nameBn: node.name.bn,
        }));
        setBoards(boardNodes);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadVersions = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      const versionNodes = (data.nodes || []).map((node: any) => ({
        _id: node._id,
        name: node.name.en,
        nameBn: node.name.bn,
      }));
      setVersions(versionNodes);
      
      // Auto-select version matching paper language
      if (versionNodes.length > 0 && !config.versionId) {
        const matchingVersion = versionNodes.find((v: CurriculumNode) =>
          config.paperLanguage === 'bn' 
            ? v.name.includes('Bangla') || v.nameBn?.includes('বাংলা')
            : v.name.includes('English')
        );
        if (matchingVersion) {
          onChange({ ...config, versionId: matchingVersion._id });
        }
      }
    } catch (error) {
      console.error('Error loading versions:', error);
    }
  };

  const loadClasses = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      const classNodes = (data.nodes || []).map((node: any) => ({
        _id: node._id,
        name: node.name.en,
        nameBn: node.name.bn,
      }));
      setClasses(classNodes);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  };

  const loadGroups = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      const groupNodes = (data.nodes || []).map((node: any) => ({
        _id: node._id,
        name: node.name.en,
        nameBn: node.name.bn,
      }));
      setGroups(groupNodes);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadSubjects = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      const subjectNodes = (data.nodes || []).map((node: any) => ({
        _id: node._id,
        name: node.name.en,
        nameBn: node.name.bn,
      }));
      setSubjects(subjectNodes);
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadChapters = async (parentId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await res.json();
      const chapterNodes = (data.nodes || []).map((node: any) => ({
        _id: node._id,
        name: node.name.en,
        nameBn: node.name.bn,
      }));
      setChapters(chapterNodes);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const addSection = () => {
    const newSection: PaperSection = {
      id: Date.now().toString(),
      title: t('paperBuilder.newSection'),
      type: 'mcq',
      questionsNeeded: 10,
      marksEach: 1,
      difficulty: 'mixed',
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
  const selectedVersion = versions.find(v => v._id === config.versionId);
  const selectedClass = classes.find(c => c._id === config.classId);
  const selectedGroup = groups.find(g => g._id === config.groupId);
  const selectedSubject = subjects.find(s => s._id === config.subjectId);

  const step2Summary = selectedClass && selectedSubject
    ? `${selectedClass.nameBn || selectedClass.name} · ${selectedSubject.nameBn || selectedSubject.name}`
    : null;

  const step3Summary = config.chapterIds?.length
    ? `${config.chapterIds.length} ${language === 'bn' ? 'অধ্যায় নির্বাচিত' : 'chapters selected'}`
    : null;

  const isStep1Complete = config.paperTitle && config.paperType;
  const isStep2Complete = config.subjectId;
  const isStep3Complete = config.chapterIds && config.chapterIds.length > 0;
  const isStep4Complete = config.sections.length > 0;

  return (
    <div className="space-y-4 pb-6">
      <div className="sticky top-0 bg-white z-10 pb-4">
        <h2 className={cn("text-lg font-bold text-edulytics-text", language === 'bn' && 'font-bengali')}>
          {t('paperBuilder.title')}
        </h2>
        <p className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
          {t('paperBuilder.subtitle')}
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
                1
              </div>
              <div className="flex-1 text-left">
                <div className={cn("font-bold text-sm text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.step1')}
                </div>
                {currentStep !== 1 && config.paperTitle && (
                  <div className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
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
                  <div className={cn("font-bold text-sm mb-1", language === 'bn' && 'font-bengali')}>
                    {t('paperBuilder.examPaper')}
                  </div>
                  <div className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                    {t('paperBuilder.examPaperDesc')}
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
                  <div className={cn("font-bold text-sm mb-1", language === 'bn' && 'font-bengali')}>
                    {t('paperBuilder.assignment')}
                  </div>
                  <div className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                    {t('paperBuilder.assignmentDesc')}
                  </div>
                </button>
              </div>

              <div className="space-y-2">
                <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.paperLanguage')}
                </Label>
                <Select 
                  value={config.paperLanguage} 
                  onValueChange={(val) => val && onChange({ ...config, paperLanguage: val as 'en' | 'bn' })}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue>
                      {config.paperLanguage === 'bn' ? (
                        <span className="font-bengali">বাংলা</span>
                      ) : (
                        'English'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="bn" className="font-bengali">বাংলা</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.paperTitle')}
                </Label>
                <Input
                  value={config.paperTitle}
                  onChange={(e) => onChange({ ...config, paperTitle: e.target.value })}
                  placeholder={t('paperBuilder.paperTitlePlaceholder')}
                  className={cn("h-9", config.paperLanguage === 'bn' && 'font-bengali')}
                />
              </div>

              {config.paperType === 'exam' && (
                <>
                  <div className="space-y-2">
                    <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                      {t('paperBuilder.schoolName')}
                    </Label>
                    <Input
                      value={config.schoolName || ''}
                      onChange={(e) => onChange({ ...config, schoolName: e.target.value })}
                      placeholder={t('paperBuilder.schoolPlaceholder')}
                      className={cn("h-9", config.paperLanguage === 'bn' && 'font-bengali')}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                        {t('paperBuilder.duration')}
                      </Label>
                      <Input
                        type="number"
                        value={config.duration || ''}
                        onChange={(e) => onChange({ ...config, duration: parseInt(e.target.value) || undefined })}
                        placeholder="180"
                        className="h-9"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                        {t('paperBuilder.fullMarks')}
                      </Label>
                      <Input
                        type="number"
                        value={config.fullMarks || ''}
                        onChange={(e) => onChange({ ...config, fullMarks: parseInt(e.target.value) || undefined })}
                        placeholder="75"
                        className="h-9"
                      />
                    </div>
                  </div>
                </>
              )}

              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!isStep1Complete}
                className={cn("w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white", language === 'bn' && 'font-bengali')}
              >
                {t('paperBuilder.next')}
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
                2
              </div>
              <div className="flex-1 text-left">
                <div className={cn("font-bold text-sm text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.step2')}
                </div>
                {currentStep !== 2 && step2Summary && (
                  <div className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
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
                <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.board')}
                </Label>
                <Select value={config.boardId} onValueChange={(val) => onChange({ ...config, boardId: val || undefined, versionId: undefined, classId: undefined, groupId: undefined, subjectId: undefined })}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder={t('paperBuilder.selectBoard')}>
                      {selectedBoard ? (language === 'bn' ? selectedBoard.nameBn || selectedBoard.name : selectedBoard.name) : t('paperBuilder.selectBoard')}
                    </SelectValue>
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

              {config.boardId && versions.length > 0 && (
                <div className="space-y-2">
                  <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                    Version / Medium
                  </Label>
                  <Select value={config.versionId} onValueChange={(val) => onChange({ ...config, versionId: val || undefined, classId: undefined, groupId: undefined, subjectId: undefined })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Version">
                        {selectedVersion ? (language === 'bn' ? selectedVersion.nameBn || selectedVersion.name : selectedVersion.name) : 'Select Version'}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map(version => (
                        <SelectItem key={version._id} value={version._id} className="font-bengali">
                          {version.nameBn || version.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {config.versionId && (
                <div className="space-y-2">
                  <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                    {t('paperBuilder.class')}
                  </Label>
                  <Select value={config.classId} onValueChange={(val) => onChange({ ...config, classId: val || undefined, groupId: undefined, subjectId: undefined })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t('paperBuilder.selectClass')}>
                        {selectedClass ? (language === 'bn' ? selectedClass.nameBn || selectedClass.name : selectedClass.name) : t('paperBuilder.selectClass')}
                      </SelectValue>
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
                  <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                    {t('paperBuilder.group')}
                  </Label>
                  <Select value={config.groupId} onValueChange={(val) => onChange({ ...config, groupId: val || undefined, subjectId: undefined })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t('paperBuilder.selectGroup')}>
                        {selectedGroup ? (language === 'bn' ? selectedGroup.nameBn || selectedGroup.name : selectedGroup.name) : t('paperBuilder.selectGroup')}
                      </SelectValue>
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
                  <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                    {t('paperBuilder.subject')}
                  </Label>
                  <Select value={config.subjectId} onValueChange={(val) => onChange({ ...config, subjectId: val || undefined })}>
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder={t('paperBuilder.selectSubject')}>
                        {selectedSubject ? (language === 'bn' ? selectedSubject.nameBn || selectedSubject.name : selectedSubject.name) : t('paperBuilder.selectSubject')}
                      </SelectValue>
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
                className={cn("w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white", language === 'bn' && 'font-bengali')}
              >
                {t('paperBuilder.next')}
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
                3
              </div>
              <div className="flex-1 text-left">
                <div className={cn("font-bold text-sm text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.step3')}
                </div>
                {currentStep !== 3 && step3Summary && (
                  <div className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
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
                <Label className={cn("text-xs font-semibold text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.allChapters')}
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
                className={cn("w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white", language === 'bn' && 'font-bengali')}
              >
                {t('paperBuilder.next')}
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
                4
              </div>
              <div className="flex-1 text-left">
                <div className={cn("font-bold text-sm text-edulytics-text", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.step4')}
                </div>
                {currentStep !== 4 && config.sections.length > 0 && (
                  <div className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                    {totalQuestions} {t('paperBuilder.questions')} · {totalMarks}
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
                      className={cn("h-8 text-sm flex-1", config.paperLanguage === 'bn' && 'font-bengali')}
                      placeholder={t('paperBuilder.sectionTitle')}
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
                      <Label className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                        {t('paperBuilder.questionType')}
                      </Label>
                      <Select value={section.type} onValueChange={(val: any) => updateSection(section.id, { type: val })}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mcq" className={language === 'bn' ? 'font-bengali' : ''}>
                            {t('questionType.mcq')}
                          </SelectItem>
                          <SelectItem value="cq" className={language === 'bn' ? 'font-bengali' : ''}>
                            {t('questionType.cq')}
                          </SelectItem>
                          <SelectItem value="sq" className={language === 'bn' ? 'font-bengali' : ''}>
                            {t('questionType.sq')}
                          </SelectItem>
                          <SelectItem value="short" className={language === 'bn' ? 'font-bengali' : ''}>
                            {t('questionType.short')}
                          </SelectItem>
                          <SelectItem value="long" className={language === 'bn' ? 'font-bengali' : ''}>
                            {t('questionType.long')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                        {t('paperBuilder.questionCount')}
                      </Label>
                      <Input
                        type="number"
                        value={section.questionsNeeded}
                        onChange={(e) => updateSection(section.id, { questionsNeeded: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                        {t('paperBuilder.marksEach')}
                      </Label>
                      <Input
                        type="number"
                        value={section.marksEach}
                        onChange={(e) => updateSection(section.id, { marksEach: parseInt(e.target.value) || 0 })}
                        className="h-8 text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                        {t('paperBuilder.answerCount')}
                      </Label>
                      <Input
                        type="number"
                        value={section.questionsToAnswer || section.questionsNeeded}
                        onChange={(e) => updateSection(section.id, { questionsToAnswer: parseInt(e.target.value) || undefined })}
                        className="h-8 text-xs"
                        placeholder={String(section.questionsNeeded)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className={cn("text-xs text-edulytics-muted", language === 'bn' && 'font-bengali')}>
                      {t('paperBuilder.difficulty')}
                    </Label>
                    <Select value={section.difficulty || 'mixed'} onValueChange={(val: any) => updateSection(section.id, { difficulty: val })}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mixed" className={language === 'bn' ? 'font-bengali' : ''}>
                          {t('paperBuilder.mixed')}
                        </SelectItem>
                        <SelectItem value="easy" className={language === 'bn' ? 'font-bengali' : ''}>
                          {t('paperBuilder.easy')}
                        </SelectItem>
                        <SelectItem value="medium" className={language === 'bn' ? 'font-bengali' : ''}>
                          {t('paperBuilder.medium')}
                        </SelectItem>
                        <SelectItem value="hard" className={language === 'bn' ? 'font-bengali' : ''}>
                          {t('paperBuilder.hard')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                onClick={addSection}
                className={cn("w-full border-edulytics-primary/30 text-edulytics-primary hover:bg-edulytics-primary-light", language === 'bn' && 'font-bengali')}
              >
                <Plus className="h-4 w-4 mr-2" />
                {t('paperBuilder.addSection')}
              </Button>
            </div>
          </CollapsibleContent>
        </ContentCard>
      </Collapsible>

      {/* Summary Card */}
      {config.sections.length > 0 && (
        <ContentCard className="bg-gradient-to-br from-edulytics-primary/10 to-purple-100/50 border-2 border-edulytics-primary/30">
          <div className="space-y-3">
            <div className={cn("font-bold text-sm text-edulytics-text", language === 'bn' && 'font-bengali')}>
              {t('paperBuilder.summary')}
            </div>

            <div className={cn("space-y-2 text-sm", language === 'bn' && 'font-bengali')}>
              <div className="flex justify-between">
                <span className="text-edulytics-muted">{t('paperBuilder.totalQuestions')}</span>
                <span className="font-semibold">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-edulytics-muted">{t('paperBuilder.totalMarks')}</span>
                <span className="font-semibold">{totalMarks}</span>
              </div>
              {config.duration && (
                <div className="flex justify-between">
                  <span className="text-edulytics-muted">{t('paperBuilder.time')}</span>
                  <span className="font-semibold">{config.duration} {t('paperBuilder.minutes')}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-edulytics-muted">{t('paperBuilder.generated')}</span>
                <span className="font-semibold">
                  {generatedCount}/{totalQuestions}
                </span>
              </div>
            </div>

            {config.fullMarks && totalMarks !== config.fullMarks && (
              <div className="flex items-start gap-2 p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className={cn("text-xs text-yellow-700", language === 'bn' && 'font-bengali')}>
                  {t('paperBuilder.marksWarning')
                    .replace('{actual}', String(totalMarks))
                    .replace('{target}', String(config.fullMarks))}
                </div>
              </div>
            )}

            <Button
              onClick={onGenerate}
              disabled={generating || !isStep4Complete}
              className={cn("w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white", language === 'bn' && 'font-bengali')}
            >
              {generating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  {t('paperBuilder.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {generatedCount > 0 ? t('paperBuilder.regeneratePaper') : t('paperBuilder.generatePaper')}
                </>
              )}
            </Button>
          </div>
        </ContentCard>
      )}
    </div>
  );
}
