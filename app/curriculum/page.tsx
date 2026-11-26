'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  FileText,
  Database,
  CheckCircle,
  TrendingUp,
  Download,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface DashboardStats {
  kpis: {
    totalQuestions: number;
    solutionCoverage: number;
    totalSources: number;
    topicCoverage: number;
  };
  typeDistribution: Record<string, number>;
  mcqKindDistribution: Record<string, number>;
  chapterDistribution: Array<{ id: string; name: string; count: number }>;
  topicStats: {
    covered: number;
    total: number;
    coverage: number;
  };
  solutionStats: {
    withSolution: number;
    withoutSolution: number;
    withMedia: number;
  };
  sourceTypeDistribution: Array<{ type: string; count: number }>;
  curriculumCounts: {
    classes: number;
    subjects: number;
    chapters: number;
    topics: number;
  };
  recentQuestions: Array<{
    _id: string;
    type: string;
    stem: string;
    difficulty?: string;
    createdAt: Date;
  }>;
}

interface CurriculumNode {
  _id: string;
  type: string;
  name: { bn: string; en: string };
  code: string;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [levelId, setLevelId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [levels, setLevels] = useState<CurriculumNode[]>([]);
  const [subjects, setSubjects] = useState<CurriculumNode[]>([]);
  const [curriculumNodes, setCurriculumNodes] = useState<CurriculumNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadStats();
    loadLevels();
    loadCurriculumRoot();
  }, []);

  useEffect(() => {
    loadStats();
  }, [levelId, subjectId]);

  useEffect(() => {
    if (levelId) {
      loadSubjects(levelId);
    } else {
      setSubjects([]);
      setSubjectId('');
    }
  }, [levelId]);

  const loadStats = async () => {
    try {
      const params = new URLSearchParams();
      if (levelId) params.append('levelId', levelId);
      if (subjectId) params.append('subjectId', subjectId);

      const response = await fetch(`/api/dashboard/stats?${params}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
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

  const loadCurriculumRoot = async () => {
    try {
      const response = await fetch('/api/curriculum/root');
      const data = await response.json();
      setCurriculumNodes(data.nodes || []);
    } catch (error) {
      console.error('Error loading curriculum:', error);
    }
  };

  const loadChildren = async (parentId: string) => {
    try {
      const response = await fetch(`/api/curriculum/children?parentId=${parentId}`);
      const data = await response.json();
      return data.nodes || [];
    } catch (error) {
      console.error('Error loading children:', error);
      return [];
    }
  };

  const toggleNode = async (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
      const children = await loadChildren(nodeId);
      setCurriculumNodes(prev => {
        const updated = [...prev];
        const index = updated.findIndex(n => n._id === nodeId);
        if (index !== -1) {
          updated.splice(index + 1, 0, ...children);
        }
        return updated;
      });
    }
    setExpandedNodes(newExpanded);
  };

  if (loading || !stats) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-edulytics-primary" />
        </div>
      </AppShell>
    );
  }

  const typeData = Object.entries(stats.typeDistribution).map(([name, value]) => ({
    name: name.toUpperCase(),
    value,
  }));

  const mcqKindData = Object.entries(stats.mcqKindDistribution).map(([name, value]) => ({
    name: name.replace('_', ' '),
    value,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Overview of your question bank and curriculum"
        action={
          <Button className="bg-edulytics-primary hover:bg-edulytics-primary/90 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        }
      />

      {/* Global Filters */}
      <div className="mb-6 flex gap-3">
        <Select value={levelId} onValueChange={(val) => setLevelId(val || '')}>
          <SelectTrigger className="w-48 h-9 text-sm border-edulytics-border">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Classes</SelectItem>
            {levels.map((level) => (
              <SelectItem key={level._id} value={level._id}>
                {level.name.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={subjectId} onValueChange={(val) => setSubjectId(val || '')} disabled={!levelId}>
          <SelectTrigger className="w-48 h-9 text-sm border-edulytics-border">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject._id} value={subject._id}>
                {subject.name.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <ContentCard className="bg-blue-50 border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-edulytics-muted mb-1">Total Questions</div>
              <div className="text-2xl font-bold text-edulytics-text">
                {stats.kpis.totalQuestions}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="bg-green-50 border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-edulytics-muted mb-1">Solution Coverage</div>
              <div className="text-2xl font-bold text-edulytics-text">
                {stats.kpis.solutionCoverage}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="bg-purple-50 border-purple-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-edulytics-muted mb-1">Total Sources</div>
              <div className="text-2xl font-bold text-edulytics-text">
                {stats.kpis.totalSources}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="bg-amber-50 border-amber-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-edulytics-muted mb-1">Topics Covered</div>
              <div className="text-2xl font-bold text-edulytics-text">
                {stats.kpis.topicCoverage}%
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Questions by Type */}
        <ContentCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-edulytics-text">Questions by Type</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ContentCard>

        {/* MCQ Kind Distribution */}
        {Object.keys(stats.mcqKindDistribution).length > 0 && (
          <ContentCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-edulytics-text">MCQ Kind Breakdown</h3>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mcqKindData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label={(entry) => `${entry.name}: ${entry.value}`}
                >
                  {mcqKindData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ContentCard>
        )}
      </div>

      {/* Questions by Chapter */}
      {stats.chapterDistribution.length > 0 && (
        <ContentCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-edulytics-text">Questions by Chapter</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.chapterDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={100} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                {stats.chapterDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#1e40af' : '#3b82f6'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ContentCard>
      )}

      {/* Solution Stats and Source Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Solution Overview */}
        <ContentCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-edulytics-text">Solutions Overview</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-edulytics-muted">With Solution</span>
                <span className="font-semibold text-edulytics-text">{stats.solutionStats.withSolution}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${stats.kpis.totalQuestions > 0 ? (stats.solutionStats.withSolution / stats.kpis.totalQuestions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-edulytics-muted">Without Solution</span>
                <span className="font-semibold text-edulytics-text">{stats.solutionStats.withoutSolution}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500"
                  style={{
                    width: `${stats.kpis.totalQuestions > 0 ? (stats.solutionStats.withoutSolution / stats.kpis.totalQuestions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-edulytics-muted">With Media</span>
                <span className="font-semibold text-edulytics-text">{stats.solutionStats.withMedia}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{
                    width: `${stats.kpis.totalQuestions > 0 ? (stats.solutionStats.withMedia / stats.kpis.totalQuestions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </ContentCard>

        {/* Source Type Distribution */}
        <ContentCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-edulytics-text">Sources by Type</h3>
          </div>
          <div className="space-y-3">
            {stats.sourceTypeDistribution.slice(0, 5).map((source, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-edulytics-muted capitalize">{source.type.replace('_', ' ')}</span>
                  <span className="font-semibold text-edulytics-text">{source.count}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${stats.kpis.totalQuestions > 0 ? (source.count / stats.kpis.totalQuestions) * 100 : 0}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Curriculum Stats and Recent Questions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Curriculum Structure */}
        <ContentCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-edulytics-text">Curriculum Structure</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
              <div className="text-xs text-edulytics-muted mb-1">Classes</div>
              <div className="text-xl font-bold text-blue-700">{stats.curriculumCounts.classes}</div>
            </div>
            <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
              <div className="text-xs text-edulytics-muted mb-1">Subjects</div>
              <div className="text-xl font-bold text-purple-700">{stats.curriculumCounts.subjects}</div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-lg p-3">
              <div className="text-xs text-edulytics-muted mb-1">Chapters</div>
              <div className="text-xl font-bold text-green-700">{stats.curriculumCounts.chapters}</div>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
              <div className="text-xs text-edulytics-muted mb-1">Topics</div>
              <div className="text-xl font-bold text-amber-700">{stats.curriculumCounts.topics}</div>
            </div>
          </div>
        </ContentCard>

        {/* Recent Additions */}
        <ContentCard>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-edulytics-text">Recent Questions</h3>
          </div>
          <div className="space-y-2">
            {stats.recentQuestions.map((question) => (
              <div key={question._id.toString()} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
                <Badge variant="outline" className="text-xs mt-0.5">
                  {question.type.toUpperCase()}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-edulytics-text truncate">{question.stem}</p>
                  {question.difficulty && (
                    <Badge className={`text-xs mt-1 ${
                      question.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                      question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {question.difficulty}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      {/* Curriculum Browser */}
      <ContentCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-edulytics-text">Curriculum Browser</h3>
          <Button
            variant="outline"
            size="sm"
            className="text-xs border-edulytics-border"
            onClick={loadCurriculumRoot}
          >
            Refresh
          </Button>
        </div>
        <div className="space-y-1">
          {curriculumNodes.map((node) => (
            <div
              key={node._id}
              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              onClick={() => toggleNode(node._id)}
            >
              <ChevronRight
                className={`w-4 h-4 text-edulytics-muted transition-transform ${
                  expandedNodes.has(node._id) ? 'rotate-90' : ''
                }`}
              />
              <BookOpen className="w-4 h-4 text-edulytics-muted" />
              <span className="text-sm text-edulytics-text">{node.name.en}</span>
              <Badge variant="outline" className="text-xs ml-auto">
                {node.type}
              </Badge>
            </div>
          ))}
        </div>
      </ContentCard>
    </AppShell>
  );
}
