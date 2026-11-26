'use client';

import { useState, useEffect } from 'react';
import { ContentCard } from './content-card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { 
  ChevronDown, 
  ChevronRight, 
  X, 
  Search,
  Filter as FilterIcon 
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/context';
import { cn } from '@/lib/utils';

interface FilterValues {
  boardIds?: string[];
  classId?: string;
  groupId?: string;
  subjectId?: string;
  chapterIds?: string[];
  topicIds?: string[];
  type?: string;
  language?: string;
  sourceType?: string;
  hasSolution?: boolean;
}

interface CurriculumNode {
  _id: string;
  name: string;
  nameBn?: string;
  type: string;
  questionCount?: number;
  children?: CurriculumNode[];
}

interface LeftFilterRailProps {
  values: FilterValues;
  onChange: (values: FilterValues) => void;
  onSearch: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function LeftFilterRail({ 
  values, 
  onChange, 
  onSearch,
  isOpen,
  onToggle 
}: LeftFilterRailProps) {
  const { t, language } = useI18n();
  const [boards, setBoards] = useState<CurriculumNode[]>([]);
  const [topicTree, setTopicTree] = useState<CurriculumNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBoards();
    if (values.subjectId) {
      loadTopicTree(values.subjectId);
    }
  }, [values.subjectId]);

  const loadBoards = async () => {
    try {
      const res = await fetch('/api/curriculum/root');
      const data = await res.json();
      if (data.nodes && data.nodes.length > 0) {
        const countryId = data.nodes[0]._id;
        const boardRes = await fetch(`/api/curriculum/children?parentId=${countryId}`);
        const boardData = await boardRes.json();
        const boardNodes = (boardData.nodes || []).map((node: any) => ({
          _id: node._id.toString(),
          name: node.name.en,
          nameBn: node.name.bn,
          type: node.type
        }));
        setBoards(boardNodes);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
    }
  };

  const loadTopicTree = async (subjectId: string) => {
    try {
      const res = await fetch(`/api/curriculum/children?parentId=${subjectId}`);
      const data = await res.json();
      const chapters = (data.nodes || []).map((node: any) => ({
        _id: node._id.toString(),
        name: node.name.en,
        nameBn: node.name.bn,
        type: node.type
      }));
      
      // Load children for each chapter to build tree
      const chaptersWithChildren = await Promise.all(
        chapters.map(async (chapter: CurriculumNode) => {
          const childRes = await fetch(`/api/curriculum/children?parentId=${chapter._id}`);
          const childData = await childRes.json();
          const children = (childData.nodes || [])
            .filter((n: any) => n.type === 'topic' || n.type === 'subchapter')
            .map((node: any) => ({
              _id: node._id.toString(),
              name: node.name.en,
              nameBn: node.name.bn,
              type: node.type
            }));
          return { ...chapter, children };
        })
      );
      
      setTopicTree(chaptersWithChildren);
    } catch (error) {
      console.error('Error loading topic tree:', error);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const toggleTopic = (topicId: string) => {
    const current = values.topicIds || [];
    const newTopics = current.includes(topicId)
      ? current.filter(id => id !== topicId)
      : [...current, topicId];
    onChange({ ...values, topicIds: newTopics });
  };

  const toggleBoard = (boardId: string) => {
    const current = values.boardIds || [];
    const newBoards = current.includes(boardId)
      ? current.filter(id => id !== boardId)
      : [...current, boardId];
    onChange({ ...values, boardIds: newBoards });
  };

  const clearAllFilters = () => {
    onChange({});
    onSearch();
  };

  const activeFilterCount = 
    (values.boardIds?.length || 0) +
    (values.topicIds?.length || 0) +
    (values.type ? 1 : 0) +
    (values.language ? 1 : 0) +
    (values.hasSolution ? 1 : 0);

  const filteredTree = searchTerm
    ? topicTree.filter(node => 
        (node.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         node.nameBn?.includes(searchTerm))
      )
    : topicTree;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggle}
        className="fixed left-4 top-20 z-20 md:hidden"
      >
        <FilterIcon className="h-4 w-4 mr-2" />
        {t('filters.board')}
      </Button>
    );
  }

  return (
    <div className={cn(
      "w-80 bg-white border-r border-edulytics-border flex-shrink-0 overflow-y-auto",
      "fixed md:static inset-y-0 left-0 z-30 md:z-0",
      !isOpen && "hidden md:block"
    )}>
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className={cn("font-bold text-edulytics-text", language === 'bn' && 'font-bengali')}>
            Filters
          </h3>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-xs h-7"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-7 w-7 md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {values.boardIds?.map(id => {
              const board = boards.find(b => b._id === id);
              return board && (
                <Badge key={id} variant="secondary" className="text-xs">
                  {board.nameBn || board.name}
                  <button
                    onClick={() => toggleBoard(id)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Board Pills */}
        <div>
          <Label className="text-xs font-semibold mb-2 block">Board</Label>
          <div className="flex flex-wrap gap-2">
            {boards.map(board => (
              <button
                key={board._id}
                onClick={() => toggleBoard(board._id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-colors border",
                  values.boardIds?.includes(board._id)
                    ? "bg-edulytics-primary text-white border-edulytics-primary"
                    : "bg-white text-edulytics-text border-gray-300 hover:border-edulytics-primary"
                )}
              >
                {board.nameBn || board.name}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Tree */}
        {values.subjectId && topicTree.length > 0 && (
          <div>
            <Label className="text-xs font-semibold mb-2 block">Topics</Label>
            <div className="relative mb-2">
              <Search className="absolute left-2 top-2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search topics..."
                className="pl-8 h-8 text-xs"
              />
            </div>
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {filteredTree.map(chapter => (
                <div key={chapter._id}>
                  <button
                    onClick={() => toggleNode(chapter._id)}
                    className="flex items-center gap-2 w-full p-2 hover:bg-gray-50 rounded text-left"
                  >
                    {expandedNodes.has(chapter._id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <span className="text-sm font-bengali flex-1">
                      {chapter.nameBn || chapter.name}
                    </span>
                    {chapter.questionCount && (
                      <span className="text-xs text-gray-500">
                        ({chapter.questionCount})
                      </span>
                    )}
                  </button>
                  {expandedNodes.has(chapter._id) && chapter.children && (
                    <div className="ml-6 space-y-1">
                      {chapter.children.map(topic => (
                        <label
                          key={topic._id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <Checkbox
                            checked={values.topicIds?.includes(topic._id)}
                            onCheckedChange={() => toggleTopic(topic._id)}
                          />
                          <span className="text-sm font-bengali flex-1">
                            {topic.nameBn || topic.name}
                          </span>
                          {topic.questionCount && (
                            <span className="text-xs text-gray-500">
                              ({topic.questionCount})
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Type Filter */}
        <div>
          <Label className="text-xs font-semibold mb-2 block">Type</Label>
          <div className="space-y-2">
            {['mcq', 'cq', 'sq', 'short', 'long'].map(type => (
              <label
                key={type}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={values.type === type}
                  onCheckedChange={(checked) => 
                    onChange({ ...values, type: checked ? type : undefined })
                  }
                />
                <span className="text-sm capitalize">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Language Filter */}
        <div>
          <Label className="text-xs font-semibold mb-2 block">Language</Label>
          <div className="space-y-2">
            {['en', 'bn'].map(lang => (
              <label
                key={lang}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Checkbox
                  checked={values.language === lang}
                  onCheckedChange={(checked) => 
                    onChange({ ...values, language: checked ? lang : undefined })
                  }
                />
                <span className={cn("text-sm", lang === 'bn' && 'font-bengali')}>
                  {lang === 'en' ? 'English' : 'বাংলা'}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Has Solution */}
        <div>
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={values.hasSolution || false}
              onCheckedChange={(checked) => 
                onChange({ ...values, hasSolution: checked as boolean })
              }
            />
            <span className="text-sm">Has Solution</span>
          </label>
        </div>

        <Button
          onClick={onSearch}
          className="w-full bg-edulytics-primary hover:bg-edulytics-primary/90"
        >
          Apply Filters
        </Button>
      </div>
    </div>
  );
}
