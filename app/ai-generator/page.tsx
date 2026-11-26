'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AIGeneratorPage() {
  const [aiConfigured, setAiConfigured] = useState(false);
  const [questionType, setQuestionType] = useState('mcq');
  const [mcqKind, setMcqKind] = useState('single');
  const [count, setCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Array<{
    stem: string;
    options?: Array<{ key: string; text: string }>;
    difficulty: string;
  }>>([]);
  const [message, setMessage] = useState('');

  const checkAIConfig = async () => {
    try {
      const response = await fetch('/api/ai/check');
      const data = await response.json();
      setAiConfigured(data.configured);
    } catch {
      console.error('AI config check error');
    }
  };

  useEffect(() => {
    checkAIConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleGenerate = async () => {
    if (!aiConfigured) {
      setMessage('AI provider not configured. Please set up API keys in environment variables.');
      return;
    }

    setGenerating(true);
    setMessage('');
    setGeneratedQuestions([]);

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: questionType,
          count: parseInt(count),
          difficulty,
          language: 'bn',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setGeneratedQuestions(data.questions || []);
        setMessage(`Successfully generated ${data.questions?.length || 0} questions!`);
      } else {
        setMessage(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      setMessage('Error generating questions');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="AI Question Generator"
        description="Generate questions using AI based on curriculum topics"
      />

      {!aiConfigured && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            AI provider not configured. Please set AI_PROVIDER and the corresponding API key in your environment variables.
          </AlertDescription>
        </Alert>
      )}

      <ContentCard>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-edulytics-text">Question Type</Label>
              <Select value={questionType} onValueChange={(val) => val && setQuestionType(val)}>
                <SelectTrigger className="h-9 border-edulytics-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="cq">CQ</SelectItem>
                  <SelectItem value="short">Short Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {questionType === 'mcq' && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-edulytics-text">MCQ Kind</Label>
                <Select value={mcqKind} onValueChange={(val) => val && setMcqKind(val)}>
                  <SelectTrigger className="h-9 border-edulytics-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="multi_statement">Multi Statement</SelectItem>
                    <SelectItem value="situation_based">Situation Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-edulytics-text">Difficulty</Label>
              <Select value={difficulty} onValueChange={(val) => val && setDifficulty(val)}>
                <SelectTrigger className="h-9 border-edulytics-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold text-edulytics-text">Number of Questions</Label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                min="1"
                max="10"
                className="h-9 border-edulytics-border"
              />
            </div>
          </div>

          {message && (
            <Alert variant={message.includes('success') || message.includes('Successfully') ? 'default' : 'destructive'}>
              {message.includes('success') || message.includes('Successfully') ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription className="text-xs">{message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!aiConfigured || generating}
            className="w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Questions
              </>
            )}
          </Button>
        </div>
      </ContentCard>

      {generatedQuestions.length > 0 && (
        <div className="mt-6">
          <h2 className="text-base font-bold text-edulytics-text mb-4">
            Generated Questions ({generatedQuestions.length})
          </h2>
          <div className="space-y-3">
            {generatedQuestions.map((q, index) => (
              <ContentCard key={index}>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Question {index + 1}</Badge>
                    <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200">{q.difficulty}</Badge>
                  </div>
                  <p className="font-bengali text-sm text-edulytics-text">{q.stem}</p>
                  {q.options && (
                    <div className="mt-2 space-y-1">
                      {q.options.map((opt) => (
                        <div key={opt.key} className="font-bengali text-xs text-edulytics-muted">
                          <span className="font-semibold">{opt.key}.</span> {opt.text}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ContentCard>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}
