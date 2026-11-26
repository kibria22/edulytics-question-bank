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
    languages: number;
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

interface CurriculumStructure {
  countries: number;
  boards: number;
  versions: number;
  classes: number;
  groups: number;
  subjects: number;
  chapters: number;
  topics: number;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [structure, setStructure] = useState<CurriculumStructure | null>(null);
  const [curriculumData, setCurriculumData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [curriculumGroupBy, setCurriculumGroupBy] = useState('board');
  const [showStacked, setShowStacked] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    loadCurriculumData();
  }, [curriculumGroupBy, showStacked]);

  const loadAll = async () => {
    try {
      const [statsRes, structureRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/dashboard/curriculum-structure'),
      ]);

      const statsData = await statsRes.json();
      const structureData = await structureRes.json();

      setStats(statsData);
      setStructure(structureData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurriculumData = async () => {
    try {
      const params = new URLSearchParams({
        groupBy: curriculumGroupBy,
        stacked: showStacked.toString(),
      });
      const response = await fetch(`/api/dashboard/questions-by-curriculum?${params}`);
      const data = await response.json();
      setCurriculumData(data.data || []);
    } catch (error) {
      console.error('Error loading curriculum data:', error);
    }
  };

  if (loading || !stats || !structure) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-edulytics-primary" />
        </div>
      </AppShell>
    );
  }

  const typeData = Object.entries(stats.typeDistribution).map(([name, value]) => ({
    name: name === 'cq' ? 'CQ' : name === 'mcq' ? 'MCQ' : name === 'sq' ? 'SQ' : name.toUpperCase(),
    value,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Dashboard"
        description="Overview of your question bank and curriculum"
        action={
          <Button size="sm" className="bg-edulytics-primary hover:bg-edulytics-primary/90 text-white">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Export Report
          </Button>
        }
      />

      {/* KPI Cards - Compact */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        <ContentCard className="bg-blue-50 border-blue-100 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-edulytics-muted uppercase tracking-wide mb-0.5">Total Questions</div>
              <div className="text-xl font-bold text-edulytics-text">{stats.kpis.totalQuestions}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="bg-green-50 border-green-100 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-edulytics-muted uppercase tracking-wide mb-0.5">Solution Coverage</div>
              <div className="text-xl font-bold text-edulytics-text">{stats.kpis.solutionCoverage}%</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="bg-purple-50 border-purple-100 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-edulytics-muted uppercase tracking-wide mb-0.5">Total Sources</div>
              <div className="text-xl font-bold text-edulytics-text">{stats.kpis.totalSources}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
              <Database className="w-4 h-4 text-purple-600" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="bg-amber-50 border-amber-100 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-edulytics-muted uppercase tracking-wide mb-0.5">Topics Covered</div>
              <div className="text-xl font-bold text-edulytics-text">{stats.kpis.topicCoverage}%</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </ContentCard>

        <ContentCard className="bg-pink-50 border-pink-100 p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] text-edulytics-muted uppercase tracking-wide mb-0.5">Languages</div>
              <div className="text-xl font-bold text-edulytics-text">{stats.kpis.languages}</div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-pink-600" />
            </div>
          </div>
        </ContentCard>
      </div>

      {/* Curriculum Structure */}
      <ContentCard className="mb-4">
        <h3 className="font-bold text-sm text-edulytics-text mb-3">Curriculum Structure</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Countries</div>
            <div className="text-lg font-bold text-blue-700">{structure.countries}</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Boards</div>
            <div className="text-lg font-bold text-purple-700">{structure.boards}</div>
          </div>
          <div className="bg-pink-50 border border-pink-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Versions</div>
            <div className="text-lg font-bold text-pink-700">{structure.versions}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Classes</div>
            <div className="text-lg font-bold text-green-700">{structure.classes}</div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Groups</div>
            <div className="text-lg font-bold text-yellow-700">{structure.groups}</div>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Subjects</div>
            <div className="text-lg font-bold text-cyan-700">{structure.subjects}</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Chapters</div>
            <div className="text-lg font-bold text-indigo-700">{structure.chapters}</div>
          </div>
          <div className="bg-teal-50 border border-teal-200 rounded p-2 text-center">
            <div className="text-[10px] text-edulytics-muted uppercase mb-0.5">Topics</div>
            <div className="text-lg font-bold text-teal-700">{structure.topics}</div>
          </div>
        </div>
      </ContentCard>

      {/* Charts Grid - 2 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Questions by Type - Compact Donut */}
        <ContentCard className="h-[240px]">
          <h3 className="font-bold text-sm text-edulytics-text mb-2">Questions by Type</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={typeData}
                cx="30%"
                cy="50%"
                innerRadius={35}
                outerRadius={60}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {typeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                iconSize={8}
                wrapperStyle={{ fontSize: '11px', paddingLeft: '10px' }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ContentCard>

        {/* Questions by Curriculum - Switchable */}
        <ContentCard className="h-[240px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-sm text-edulytics-text">Questions by Curriculum</h3>
            <div className="flex gap-1">
              <Select value={curriculumGroupBy} onValueChange={(val) => val && setCurriculumGroupBy(val)}>
                <SelectTrigger className="h-6 text-[10px] border-edulytics-border w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="board">Board</SelectItem>
                  <SelectItem value="version">Version</SelectItem>
                  <SelectItem value="level">Class</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                  <SelectItem value="subject">Subject</SelectItem>
                  <SelectItem value="chapter">Chapter</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                </SelectContent>
              </Select>
              {curriculumGroupBy !== 'type' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowStacked(!showStacked)}
                  className="h-6 px-2 text-[10px]"
                >
                  {showStacked ? 'Simple' : 'Stacked'}
                </Button>
              )}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart 
              data={curriculumData.slice(0, 10)} 
              layout="vertical"
              margin={{ right: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 11 }} 
                width={120}
              />
              <XAxis 
                type="number" 
                tick={{ fontSize: 10 }} 
                allowDecimals={false}
              />
              <Tooltip />
              {showStacked && curriculumGroupBy !== 'type' && curriculumGroupBy !== 'language' ? (
                <>
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="MCQ" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="CQ" stackId="a" fill="#8b5cf6" />
                  <Bar dataKey="SQ" stackId="a" fill="#06b6d4" />
                  <Bar dataKey="Long" stackId="a" fill="#10b981" />
                </>
              ) : (
                <Bar dataKey="count" fill="#3b82f6" label={{ position: 'right', fontSize: 10 }}>
                  {curriculumData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1e40af' : '#3b82f6'} />
                  ))}
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </ContentCard>
      </div>

      {/* Solutions and Sources - 2 Column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ContentCard className="h-[220px]">
          <h3 className="font-bold text-sm text-edulytics-text mb-3">Solutions Overview</h3>
          <div className="space-y-2.5">
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-edulytics-muted">With Solution</span>
                <span className="font-semibold text-edulytics-text">{stats.solutionStats.withSolution}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: `${stats.kpis.totalQuestions > 0 ? (stats.solutionStats.withSolution / stats.kpis.totalQuestions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-edulytics-muted">Without Solution</span>
                <span className="font-semibold text-edulytics-text">{stats.solutionStats.withoutSolution}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500"
                  style={{
                    width: `${stats.kpis.totalQuestions > 0 ? (stats.solutionStats.withoutSolution / stats.kpis.totalQuestions) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-edulytics-muted">With Media</span>
                <span className="font-semibold text-edulytics-text">{stats.solutionStats.withMedia}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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

        <ContentCard className="h-[220px]">
          <h3 className="font-bold text-sm text-edulytics-text mb-3">Sources by Type</h3>
          {stats.sourceTypeDistribution.length > 0 ? (
            <div className="space-y-2.5">
              {stats.sourceTypeDistribution.slice(0, 5).map((source, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between text-[10px] mb-1">
                    <span className="text-edulytics-muted capitalize">{source.type.replace('_', ' ')}</span>
                    <span className="font-semibold text-edulytics-text">{source.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
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
          ) : (
            <div className="flex items-center justify-center h-32 text-xs text-edulytics-muted">
              No source data available
            </div>
          )}
        </ContentCard>
      </div>

      {/* Recent Questions */}
      <ContentCard>
        <h3 className="font-bold text-sm text-edulytics-text mb-3">Recent Questions</h3>
        <div className="space-y-1.5">
          {stats.recentQuestions.map((question) => (
            <div key={question._id.toString()} className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded">
              <Badge variant="outline" className="text-[10px] mt-0.5">
                {question.type.toUpperCase()}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-edulytics-text truncate">{question.stem}</p>
                {question.difficulty && (
                  <Badge className={`text-[10px] mt-1 ${
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
    </AppShell>
  );
}
