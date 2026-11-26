'use client';

import { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

export interface QuestionFilterValues {
  search?: string;
  type?: string;
  mcqKind?: string;
  difficulty?: string;
  language?: string;
  levelId?: string;
  subjectId?: string;
  chapterId?: string;
  topicId?: string;
  sourceType?: string;
  sourceId?: string;
  minMarks?: string;
  maxMarks?: string;
  hasSolution?: boolean;
  hasMedia?: boolean;
}

interface QuestionFiltersProps {
  values: QuestionFilterValues;
  onChange: (values: QuestionFilterValues) => void;
  onSearch: () => void;
  resultCount?: number;
}

interface FilterOptions {
  types: string[];
  mcqKinds: string[];
  difficulties: string[];
  sourceTypes: string[];
  hasSolutions: boolean;
  hasMedia: boolean;
}

interface CurriculumNode {
  _id: string;
  type: string;
  name: { bn: string; en: string };
  parentId?: string;
}

export function QuestionFilters({ values, onChange, onSearch, resultCount }: QuestionFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    types: [],
    mcqKinds: [],
    difficulties: [],
    sourceTypes: [],
    hasSolutions: false,
    hasMedia: false,
  });
  const [levels, setLevels] = useState<CurriculumNode[]>([]);
  const [subjects, setSubjects] = useState<CurriculumNode[]>([]);
  const [chapters, setChapters] = useState<CurriculumNode[]>([]);
  const [topics, setTopics] = useState<CurriculumNode[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  useEffect(() => {
    loadFilterOptions();
    loadLevels();
  }, []);

  useEffect(() => {
    if (values.levelId) {
      loadSubjects(values.levelId);
    } else {
      setSubjects([]);
      setChapters([]);
      setTopics([]);
    }
  }, [values.levelId]);

  useEffect(() => {
    if (values.subjectId) {
      loadChapters(values.subjectId);
    } else {
      setChapters([]);
      setTopics([]);
    }
  }, [values.subjectId]);

  useEffect(() => {
    if (values.chapterId) {
      loadTopics(values.chapterId);
    } else {
      setTopics([]);
    }
  }, [values.chapterId]);

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/questions/filter-options');
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadLevels = async () => {
    try {
      const response = await fetch('/api/curriculum/root');
      const data = await response.json();
      if (data.nodes && data.nodes.length > 0) {
        const countryId = data.nodes[0]._id;
        const boardResponse = await fetch(`/api/curriculum/children?parentId=${countryId}`);
        const boardData = await boardResponse.json();
        if (boardData.nodes && boardData.nodes.length > 0) {
          const boardId = boardData.nodes[0]._id;
          const versionResponse = await fetch(`/api/curriculum/children?parentId=${boardId}`);
          const versionData = await versionResponse.json();
          if (versionData.nodes && versionData.nodes.length > 0) {
            const versionId = versionData.nodes[0]._id;
            const levelResponse = await fetch(`/api/curriculum/children?parentId=${versionId}`);
            const levelData = await levelResponse.json();
            setLevels(levelData.nodes || []);
          }
        }
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const loadSubjects = async (levelId: string) => {
    try {
      const groupResponse = await fetch(`/api/curriculum/children?parentId=${levelId}`);
      const groupData = await groupResponse.json();
      if (groupData.nodes && groupData.nodes.length > 0) {
        const groupId = groupData.nodes[0]._id;
        const subjectResponse = await fetch(`/api/curriculum/children?parentId=${groupId}`);
        const subjectData = await subjectResponse.json();
        setSubjects(subjectData.nodes || []);
      }
    } catch (error) {
      console.error('Error loading subjects:', error);
    }
  };

  const loadChapters = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${subjectId}`);
      const data = await response.json();
      setChapters(data.nodes || []);
    } catch (error) {
      console.error('Error loading chapters:', error);
    }
  };

  const loadTopics = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${chapterId}`);
      const data = await response.json();
      setTopics(data.nodes || []);
    } catch (error) {
      console.error('Error loading topics:', error);
    }
  };

  const updateFilter = (key: keyof QuestionFilterValues, value: string | boolean | undefined | null) => {
    onChange({ ...values, [key]: value === null ? undefined : value });
  };

  const removeFilter = (key: keyof QuestionFilterValues) => {
    const newValues = { ...values };
    delete newValues[key];
    
    if (key === 'levelId') {
      delete newValues.subjectId;
      delete newValues.chapterId;
      delete newValues.topicId;
    } else if (key === 'subjectId') {
      delete newValues.chapterId;
      delete newValues.topicId;
    } else if (key === 'chapterId') {
      delete newValues.topicId;
    }
    
    onChange(newValues);
  };

  const clearAllFilters = () => {
    onChange({});
  };

  const getActiveFilters = () => {
    const active: Array<{ key: keyof QuestionFilterValues; label: string }> = [];
    
    if (values.search) active.push({ key: 'search', label: `Search: ${values.search}` });
    if (values.type) active.push({ key: 'type', label: `Type: ${values.type.toUpperCase()}` });
    if (values.mcqKind) active.push({ key: 'mcqKind', label: `MCQ: ${values.mcqKind}` });
    if (values.difficulty) active.push({ key: 'difficulty', label: `Difficulty: ${values.difficulty}` });
    if (values.language) active.push({ key: 'language', label: `Language: ${values.language === 'bn' ? 'Bangla' : values.language === 'en' ? 'English' : values.language}` });
    if (values.levelId) {
      const level = levels.find(l => l._id === values.levelId);
      if (level) active.push({ key: 'levelId', label: `Level: ${level.name.en}` });
    }
    if (values.subjectId) {
      const subject = subjects.find(s => s._id === values.subjectId);
      if (subject) active.push({ key: 'subjectId', label: `Subject: ${subject.name.en}` });
    }
    if (values.chapterId) {
      const chapter = chapters.find(c => c._id === values.chapterId);
      if (chapter) active.push({ key: 'chapterId', label: `Chapter: ${chapter.name.en}` });
    }
    if (values.topicId) {
      const topic = topics.find(t => t._id === values.topicId);
      if (topic) active.push({ key: 'topicId', label: `Topic: ${topic.name.en}` });
    }
    if (values.sourceType) active.push({ key: 'sourceType', label: `Source: ${values.sourceType}` });
    if (values.minMarks) active.push({ key: 'minMarks', label: `Min marks: ${values.minMarks}` });
    if (values.maxMarks) active.push({ key: 'maxMarks', label: `Max marks: ${values.maxMarks}` });
    if (values.hasSolution) active.push({ key: 'hasSolution', label: 'Has solution' });
    if (values.hasMedia) active.push({ key: 'hasMedia', label: 'Has media' });
    
    return active;
  };

  const activeFilters = getActiveFilters();

  return (
    <div className="bg-white border border-edulytics-border rounded-lg p-4 space-y-4">
      {/* Primary Filters - Compact Single Row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-edulytics-muted" />
          <Input
            placeholder="Search questions..."
            value={values.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="pl-8 h-8 text-xs border-edulytics-border"
          />
        </div>

        <Select
          value={values.type || 'all'}
          onValueChange={(val) => updateFilter('type', val === 'all' ? undefined : val)}
        >
          <SelectTrigger className="w-28 h-8 text-xs border-edulytics-border">
            <SelectValue>
              {values.type ? values.type.toUpperCase() : 'All Types'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {filterOptions.types.map((type) => (
              <SelectItem key={type} value={type}>
                {type.toUpperCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {values.type === 'mcq' && filterOptions.mcqKinds.length > 0 && (
          <Select
            value={values.mcqKind || 'all'}
            onValueChange={(val) => updateFilter('mcqKind', val === 'all' ? undefined : val)}
          >
            <SelectTrigger className="w-32 h-8 text-xs border-edulytics-border">
              <SelectValue>
                {values.mcqKind ? values.mcqKind.replace('_', ' ') : 'All MCQ'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All MCQ</SelectItem>
              {filterOptions.mcqKinds.map((kind) => (
                <SelectItem key={kind} value={kind}>
                  {kind.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={values.difficulty || 'all'}
          onValueChange={(val) => updateFilter('difficulty', val === 'all' ? undefined : val)}
        >
          <SelectTrigger className="w-28 h-8 text-xs border-edulytics-border">
            <SelectValue>
              {values.difficulty ? values.difficulty.charAt(0).toUpperCase() + values.difficulty.slice(1) : 'All Difficulty'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Difficulty</SelectItem>
            {filterOptions.difficulties.map((diff) => (
              <SelectItem key={diff} value={diff}>
                {diff.charAt(0).toUpperCase() + diff.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.language || 'all'}
          onValueChange={(val) => updateFilter('language', val === 'all' ? undefined : val)}
        >
          <SelectTrigger className="w-24 h-8 text-xs border-edulytics-border">
            <SelectValue>
              {values.language === 'bn' ? 'Bangla' : values.language === 'en' ? 'English' : 'All Languages'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Languages</SelectItem>
            <SelectItem value="bn">Bangla</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          onClick={onSearch}
          className="h-8 px-3 text-xs bg-edulytics-primary text-white hover:bg-edulytics-primary/90"
        >
          <Search className="h-3.5 w-3.5 mr-1" />
          Search
        </Button>
      </div>

      {/* More Filters Toggle */}
      <Collapsible open={showMoreFilters} onOpenChange={setShowMoreFilters}>
        <CollapsibleTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-xs font-medium transition-colors hover:bg-gray-50 h-7 px-2 text-edulytics-muted hover:text-edulytics-text">
          <Filter className="h-3 w-3 mr-1" />
          {showMoreFilters ? 'Less' : 'More'} Filters
          <ChevronDown className={`h-3 w-3 ml-1 transition-transform ${showMoreFilters ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 mt-3 pt-3 border-t border-edulytics-border">
          {/* Curriculum Filters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <div>
              <Label className="text-xs text-edulytics-muted mb-1 block">Class</Label>
              <Select
                value={values.levelId || 'all'}
                onValueChange={(val) => updateFilter('levelId', val === 'all' ? undefined : val)}
              >
                <SelectTrigger className="h-8 text-xs border-edulytics-border">
                  <SelectValue>{values.levelId ? levels.find(l => l._id === values.levelId)?.name.en : 'All Classes'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level._id} value={level._id}>
                      {level.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-edulytics-muted mb-1 block">Subject</Label>
              <Select
                value={values.subjectId || 'all'}
                onValueChange={(val) => updateFilter('subjectId', val === 'all' ? undefined : val)}
                disabled={!values.levelId}
              >
                <SelectTrigger className="h-8 text-xs border-edulytics-border">
                  <SelectValue>{values.subjectId ? subjects.find(s => s._id === values.subjectId)?.name.en : 'All Subjects'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject._id} value={subject._id}>
                      {subject.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-edulytics-muted mb-1 block">Chapter</Label>
              <Select
                value={values.chapterId || 'all'}
                onValueChange={(val) => updateFilter('chapterId', val === 'all' ? undefined : val)}
                disabled={!values.subjectId}
              >
                <SelectTrigger className="h-8 text-xs border-edulytics-border">
                  <SelectValue>{values.chapterId ? chapters.find(c => c._id === values.chapterId)?.name.en : 'All Chapters'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Chapters</SelectItem>
                  {chapters.map((chapter) => (
                    <SelectItem key={chapter._id} value={chapter._id}>
                      {chapter.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-edulytics-muted mb-1 block">Topic</Label>
              <Select
                value={values.topicId || 'all'}
                onValueChange={(val) => updateFilter('topicId', val === 'all' ? undefined : val)}
                disabled={!values.chapterId}
              >
                <SelectTrigger className="h-8 text-xs border-edulytics-border">
                  <SelectValue>{values.topicId ? topics.find(t => t._id === values.topicId)?.name.en : 'All Topics'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic._id} value={topic._id}>
                      {topic.name.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Source & Marks Filters */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-xs text-edulytics-muted mb-1 block">Source</Label>
              <Select
                value={values.sourceType || 'all'}
                onValueChange={(val) => updateFilter('sourceType', val === 'all' ? undefined : val)}
              >
                <SelectTrigger className="h-8 text-xs border-edulytics-border">
                  <SelectValue>{values.sourceType ? values.sourceType.replace('_', ' ') : 'All Sources'}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sources</SelectItem>
                  {filterOptions.sourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-edulytics-muted mb-1 block">Min Marks</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={values.minMarks || ''}
                onChange={(e) => updateFilter('minMarks', e.target.value || undefined)}
                className="h-8 text-xs border-edulytics-border"
              />
            </div>

            <div>
              <Label className="text-xs text-edulytics-muted mb-1 block">Max Marks</Label>
              <Input
                type="number"
                min="0"
                placeholder="100"
                value={values.maxMarks || ''}
                onChange={(e) => updateFilter('maxMarks', e.target.value || undefined)}
                className="h-8 text-xs border-edulytics-border"
              />
            </div>
          </div>

          {/* Toggle Filters */}
          <div className="flex flex-wrap gap-4">
            {filterOptions.hasSolutions && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasSolution"
                  checked={values.hasSolution || false}
                  onCheckedChange={(checked) => updateFilter('hasSolution', checked as boolean)}
                />
                <Label htmlFor="hasSolution" className="text-sm text-edulytics-text cursor-pointer">
                  Has Solution
                </Label>
              </div>
            )}

            {filterOptions.hasMedia && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasMedia"
                  checked={values.hasMedia || false}
                  onCheckedChange={(checked) => updateFilter('hasMedia', checked as boolean)}
                />
                <Label htmlFor="hasMedia" className="text-sm text-edulytics-text cursor-pointer">
                  Has Media
                </Label>
              </div>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Active Filters & Result Count */}
      {(activeFilters.length > 0 || typeof resultCount === 'number') && (
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-edulytics-border">
          {typeof resultCount === 'number' && (
            <div className="text-sm text-edulytics-muted font-medium">
              {resultCount} {resultCount === 1 ? 'result' : 'results'}
            </div>
          )}
          
          {activeFilters.length > 0 && (
            <>
              <div className="text-sm text-edulytics-muted">•</div>
              <div className="flex flex-wrap items-center gap-2 flex-1">
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter.key}
                    variant="secondary"
                    className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 pl-2 pr-1 py-1 text-xs"
                  >
                    {filter.label}
                    <button
                      onClick={() => removeFilter(filter.key)}
                      className="ml-1.5 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs text-edulytics-muted hover:text-edulytics-text h-7"
              >
                Clear all
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
