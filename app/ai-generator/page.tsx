'use client';

import { useState, useEffect } from 'react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

export default function AIGeneratorPage() {
  const [language, setLanguage] = useState<'bn' | 'en'>('bn');
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
    checkAIConfig(); // eslint-disable-line react-hooks/exhaustive-deps
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
          mcqKind: questionType === 'mcq' ? mcqKind : undefined,
          count: parseInt(count),
          difficulty,
          language,
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
    <AppShell language={language} onLanguageChange={setLanguage} aiConfigured={aiConfigured}>
      <div className="p-8 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Question Generator
          </h1>
          <p className="text-muted-foreground mt-1">
            Generate questions using AI based on curriculum topics
          </p>
        </div>

        {!aiConfigured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              AI provider not configured. Please set AI_PROVIDER and the corresponding API key
              (OPENAI_API_KEY, ANTHROPIC_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY) in your
              environment variables.
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Generation Parameters</CardTitle>
            <CardDescription>
              Configure the AI to generate questions matching your requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Question Type</Label>
                <Select value={questionType} onValueChange={(val) => val && setQuestionType(val)}>
                  <SelectTrigger>
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
                  <Label>MCQ Kind</Label>
                  <Select value={mcqKind} onValueChange={(val) => val && setMcqKind(val)}>
                    <SelectTrigger>
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
                <Label>Difficulty</Label>
                <Select value={difficulty} onValueChange={(val) => val && setDifficulty(val)}>
                  <SelectTrigger>
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
                <Label>Number of Questions</Label>
                <Input
                  type="number"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  min="1"
                  max="10"
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
                <AlertDescription>{message}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerate}
              disabled={!aiConfigured || generating}
              className="w-full"
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
          </CardContent>
        </Card>

        {generatedQuestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Questions ({generatedQuestions.length})</CardTitle>
              <CardDescription>
                Review and edit before saving to the question bank
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {generatedQuestions.map((q, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Question {index + 1}</Badge>
                        <Badge>{q.difficulty}</Badge>
                      </div>
                      <p className={language === 'bn' ? 'font-bengali' : ''}>
                        {q.stem}
                      </p>
                      {q.options && (
                        <div className="mt-2 space-y-1">
                          {q.options.map((opt) => (
                            <div key={opt.key} className={language === 'bn' ? 'font-bengali text-sm' : 'text-sm'}>
                              <span className="font-semibold">{opt.key}.</span> {opt.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
