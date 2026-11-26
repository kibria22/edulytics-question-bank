'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

export interface QuestionFilterValues {
  search?: string;
  type?: string;
  mcqKind?: string;
  difficulty?: string;
  language?: string;
  boardId?: string;
  levelId?: string;
  groupId?: string;
  subjectId?: string;
  chapterId?: string;
  subchapterId?: string;
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
  const [boards, setBoards] = useState<CurriculumNode[]>([]);
  const [levels, setLevels] = useState<CurriculumNode[]>([]);
  const [groups, setGroups] = useState<CurriculumNode[]>([]);
  const [subjects, setSubjects] = useState<CurriculumNode[]>([]);
  const [chapters, setChapters] = useState<CurriculumNode[]>([]);
  const [subchapters, setSubchapters] = useState<CurriculumNode[]>([]);
  const [topics, setTopics] = useState<CurriculumNode[]>([]);

  useEffect(() => {
    loadFilterOptions();
    loadBoards();
  }, []);

  useEffect(() => {
    if (values.boardId) {
      loadLevels(values.boardId);
    } else {
      setLevels([]);
      setGroups([]);
      setSubjects([]);
      setChapters([]);
      setSubchapters([]);
      setTopics([]);
    }
  }, [values.boardId]);

  useEffect(() => {
    if (values.levelId) {
      loadGroups(values.levelId);
    } else {
      setGroups([]);
      setSubjects([]);
      setChapters([]);
      setSubchapters([]);
      setTopics([]);
    }
  }, [values.levelId]);

  useEffect(() => {
    if (values.groupId) {
      loadSubjects(values.groupId);
    } else {
      setSubjects([]);
      setChapters([]);
      setSubchapters([]);
      setTopics([]);
    }
  }, [values.groupId]);

  useEffect(() => {
    if (values.subjectId) {
      loadChapters(values.subjectId);
    } else {
      setChapters([]);
      setSubchapters([]);
      setTopics([]);
    }
  }, [values.subjectId]);

  useEffect(() => {
    if (values.chapterId) {
      loadSubchapters(values.chapterId);
    } else {
      setSubchapters([]);
      setTopics([]);
    }
  }, [values.chapterId]);

  useEffect(() => {
    const parentId = values.subchapterId || values.chapterId;
    if (parentId) {
      loadTopics(parentId);
    } else {
      setTopics([]);
    }
  }, [values.subchapterId, values.chapterId]);

  const loadFilterOptions = async () => {
    try {
      const response = await fetch('/api/questions/filter-options');
      const data = await response.json();
      setFilterOptions(data);
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };

  const loadBoards = async () => {
    try {
      const response = await fetch('/api/curriculum/root');
      const data = await response.json();
      if (data.nodes && data.nodes.length > 0) {
        const countryId = data.nodes[0]._id;
        const boardResponse = await fetch(`/api/curriculum/children?parentId=${countryId}`);
        const boardData = await boardResponse.json();
        setBoards(boardData.nodes || []);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadLevels = async (boardId: string) => {
    try {
      const versionResponse = await fetch(`/api/curriculum/children?parentId=${boardId}`);
      const versionData = await versionResponse.json();
      if (versionData.nodes && versionData.nodes.length > 0) {
        const versionId = versionData.nodes[0]._id;
        const levelResponse = await fetch(`/api/curriculum/children?parentId=${versionId}`);
        const levelData = await levelResponse.json();
        setLevels(levelData.nodes || []);
      }
    } catch (error) {
      console.error('Error loading levels:', error);
    }
  };

  const loadGroups = async (levelId: string) => {
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${levelId}`);
      const data = await response.json();
      setGroups(data.nodes || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadSubjects = async (groupId: string) => {
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${groupId}`);
      const data = await response.json();
      setSubjects(data.nodes || []);
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

  const loadSubchapters = async (chapterId: string) => {
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${chapterId}`);
      const data = await response.json();
      const subchapters = data.nodes?.filter((n: CurriculumNode) => n.type === 'subchapter') || [];
      setSubchapters(subchapters);
      
      if (subchapters.length === 0) {
        loadTopics(chapterId);
      }
    } catch (error) {
      console.error('Error loading subchapters:', error);
    }
  };

  const loadTopics = async (parentId: string) => {
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await response.json();
      setTopics(data.nodes?.filter((n: CurriculumNode) => n.type === 'topic') || []);
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
    
    if (key === 'boardId') {
      delete newValues.levelId;
      delete newValues.groupId;
      delete newValues.subjectId;
      delete newValues.chapterId;
      delete newValues.subchapterId;
      delete newValues.topicId;
    } else if (key === 'levelId') {
      delete newValues.groupId;
      delete newValues.subjectId;
      delete newValues.chapterId;
      delete newValues.subchapterId;
      delete newValues.topicId;
    } else if (key === 'groupId') {
      delete newValues.subjectId;
      delete newValues.chapterId;
      delete newValues.subchapterId;
      delete newValues.topicId;
    } else if (key === 'subjectId') {
      delete newValues.chapterId;
      delete newValues.subchapterId;
      delete newValues.topicId;
    } else if (key === 'chapterId') {
      delete newValues.subchapterId;
      delete newValues.topicId;
    } else if (key === 'subchapterId') {
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
    if (values.boardId) {
      const board = boards.find(b => b._id === values.boardId);
      if (board) active.push({ key: 'boardId', label: `Board: ${board.name.en}` });
    }
    if (values.levelId) {
      const level = levels.find(l => l._id === values.levelId);
      if (level) active.push({ key: 'levelId', label: `Class: ${level.name.en}` });
    }
    if (values.groupId) {
      const group = groups.find(g => g._id === values.groupId);
      if (group) active.push({ key: 'groupId', label: `Group: ${group.name.en}` });
    }
    if (values.subjectId) {
      const subject = subjects.find(s => s._id === values.subjectId);
      if (subject) active.push({ key: 'subjectId', label: `Subject: ${subject.name.en}` });
    }
    if (values.chapterId) {
      const chapter = chapters.find(c => c._id === values.chapterId);
      if (chapter) active.push({ key: 'chapterId', label: `Chapter: ${chapter.name.en}` });
    }
    if (values.subchapterId) {
      const subchapter = subchapters.find(s => s._id === values.subchapterId);
      if (subchapter) active.push({ key: 'subchapterId', label: `Sub: ${subchapter.name.en}` });
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
    <div className="bg-white border border-edulytics-border rounded-lg p-3 space-y-2.5">
      {/* Primary Row: Curriculum Cascade */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Select
          value={values.boardId || 'all'}
          onValueChange={(val) => updateFilter('boardId', val === 'all' ? undefined : val)}
        >
          <SelectTrigger className="w-28 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.boardId ? boards.find(b => b._id === values.boardId)?.name.en : 'Board'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Boards</SelectItem>
            {boards.map((board) => (
              <SelectItem key={board._id} value={board._id}>
                {board.name.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.levelId || 'all'}
          onValueChange={(val) => updateFilter('levelId', val === 'all' ? undefined : val)}
          disabled={!values.boardId}
        >
          <SelectTrigger className="w-28 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.levelId ? levels.find(l => l._id === values.levelId)?.name.en : 'Class'}</SelectValue>
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

        <Select
          value={values.groupId || 'all'}
          onValueChange={(val) => updateFilter('groupId', val === 'all' ? undefined : val)}
          disabled={!values.levelId}
        >
          <SelectTrigger className="w-28 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.groupId ? groups.find(g => g._id === values.groupId)?.name.en : 'Group'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group._id} value={group._id}>
                {group.name.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={values.subjectId || 'all'}
          onValueChange={(val) => updateFilter('subjectId', val === 'all' ? undefined : val)}
          disabled={!values.groupId}
        >
          <SelectTrigger className="w-36 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.subjectId ? subjects.find(s => s._id === values.subjectId)?.name.en : 'Subject'}</SelectValue>
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

        <Select
          value={values.chapterId || 'all'}
          onValueChange={(val) => updateFilter('chapterId', val === 'all' ? undefined : val)}
          disabled={!values.subjectId}
        >
          <SelectTrigger className="w-32 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.chapterId ? chapters.find(c => c._id === values.chapterId)?.name.en : 'Chapter'}</SelectValue>
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

        {subchapters.length > 0 && (
          <Select
            value={values.subchapterId || 'all'}
            onValueChange={(val) => updateFilter('subchapterId', val === 'all' ? undefined : val)}
            disabled={!values.chapterId}
          >
            <SelectTrigger className="w-32 h-8 text-xs border-edulytics-border">
              <SelectValue>{values.subchapterId ? subchapters.find(s => s._id === values.subchapterId)?.name.en : 'Sub-chapter'}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sub-chapters</SelectItem>
              {subchapters.map((subchapter) => (
                <SelectItem key={subchapter._id} value={subchapter._id}>
                  {subchapter.name.en}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={values.topicId || 'all'}
          onValueChange={(val) => updateFilter('topicId', val === 'all' ? undefined : val)}
          disabled={!values.chapterId && !values.subchapterId}
        >
          <SelectTrigger className="w-32 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.topicId ? topics.find(t => t._id === values.topicId)?.name.en : 'Topic'}</SelectValue>
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

      {/* Secondary Row: Type, Difficulty, Language, Source, Toggles, Search */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Select
          value={values.type || 'all'}
          onValueChange={(val) => updateFilter('type', val === 'all' ? undefined : val)}
        >
          <SelectTrigger className="w-24 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.type ? values.type.toUpperCase() : 'Type'}</SelectValue>
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
              <SelectValue>{values.mcqKind ? values.mcqKind.replace('_', ' ') : 'MCQ Kind'}</SelectValue>
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
            <SelectValue>{values.difficulty ? values.difficulty.charAt(0).toUpperCase() + values.difficulty.slice(1) : 'Difficulty'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
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
          <SelectTrigger className="w-28 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.language === 'bn' ? 'Bangla' : values.language === 'en' ? 'English' : 'Language'}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="bn">Bangla</SelectItem>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ar">Arabic</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={values.sourceType || 'all'}
          onValueChange={(val) => updateFilter('sourceType', val === 'all' ? undefined : val)}
        >
          <SelectTrigger className="w-28 h-8 text-xs border-edulytics-border">
            <SelectValue>{values.sourceType ? values.sourceType.replace('_', ' ') : 'Source'}</SelectValue>
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

        {filterOptions.hasSolutions && (
          <div className="flex items-center gap-1.5 px-2 h-8 border border-edulytics-border rounded">
            <Checkbox
              id="hasSolution"
              checked={values.hasSolution || false}
              onCheckedChange={(checked) => updateFilter('hasSolution', checked as boolean)}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor="hasSolution" className="text-xs text-edulytics-text cursor-pointer">
              Solution
            </Label>
          </div>
        )}

        {filterOptions.hasMedia && (
          <div className="flex items-center gap-1.5 px-2 h-8 border border-edulytics-border rounded">
            <Checkbox
              id="hasMedia"
              checked={values.hasMedia || false}
              onCheckedChange={(checked) => updateFilter('hasMedia', checked as boolean)}
              className="h-3.5 w-3.5"
            />
            <Label htmlFor="hasMedia" className="text-xs text-edulytics-text cursor-pointer">
              Media
            </Label>
          </div>
        )}

        <div className="relative flex-1 min-w-[150px]">
          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-edulytics-muted" />
          <Input
            placeholder="Search..."
            value={values.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSearch()}
            className="pl-8 h-8 text-xs border-edulytics-border"
          />
        </div>

        <Button
          size="sm"
          onClick={onSearch}
          className="h-8 px-3 text-xs bg-edulytics-primary text-white hover:bg-edulytics-primary/90"
        >
          Go
        </Button>
      </div>

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
