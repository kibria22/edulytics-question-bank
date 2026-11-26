'use client';

import { useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/edulytics/page-header';
import { ContentCard } from '@/components/edulytics/content-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Save, AlertCircle, FileEdit } from 'lucide-react';

export default function EditorPage() {
  const [questionType, setQuestionType] = useState('mcq');
  const [mcqKind, setMcqKind] = useState('single');
  const [stem, setStem] = useState('');
  const [options, setOptions] = useState([{ key: 'ক', text: '' }, { key: 'খ', text: '' }]);
  const [difficulty, setDifficulty] = useState('medium');
  const [marks, setMarks] = useState('1');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const addOption = () => {
    const nextKey = String.fromCharCode(2453 + options.length);
    setOptions([...options, { key: nextKey, text: '' }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, text: string) => {
    const newOptions = [...options];
    newOptions[index].text = text;
    setOptions(newOptions);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');

    try {
      const questionData = {
        type: questionType,
        language: 'bn',
        stem,
        ...(questionType === 'mcq' && { mcqKind, options }),
        difficulty,
        marks: parseFloat(marks) || undefined,
      };

      const response = await fetch('/api/questions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Question saved successfully!');
        setStem('');
        setOptions([{ key: 'ক', text: '' }, { key: 'খ', text: '' }]);
      } else {
        setMessage(data.error || 'Failed to save question');
      }
    } catch (error) {
      setMessage('Error saving question');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Question Editor"
        description="Create and edit questions with live validation"
      />

      <ContentCard>
        <div className="space-y-6">
          {/* Type and Language */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-edulytics-text">Question Type</Label>
              <Select value={questionType} onValueChange={(val) => val && setQuestionType(val)}>
                <SelectTrigger className="h-9 border-edulytics-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mcq">MCQ</SelectItem>
                  <SelectItem value="cq">CQ (Creative Question)</SelectItem>
                  <SelectItem value="sq">SQ (Structured)</SelectItem>
                  <SelectItem value="short">Short Question</SelectItem>
                  <SelectItem value="long">Long Question</SelectItem>
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

          {/* Question Stem */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-edulytics-text">Question Stem</Label>
            <Textarea
              value={stem}
              onChange={(e) => setStem(e.target.value)}
              placeholder="Enter question text (supports Markdown and LaTeX with $...$ syntax)"
              className="font-bengali border-edulytics-border"
              rows={4}
            />
            <p className="text-xs text-edulytics-muted">
              Use $...$ for math expressions. Example: $\frac{3}{4}$
            </p>
          </div>

          {/* MCQ Options */}
          {questionType === 'mcq' && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-edulytics-text">Options</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option.key}
                      disabled
                      className="w-16 text-center font-bengali border-edulytics-border h-9"
                    />
                    <Input
                      value={option.text}
                      onChange={(e) => updateOption(index, e.target.value)}
                      placeholder="Option text"
                      className="flex-1 font-bengali border-edulytics-border h-9"
                    />
                    {options.length > 2 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => removeOption(index)}
                        className="h-9 w-9 border-edulytics-border"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={addOption}
                className="w-full border-edulytics-border"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Option
              </Button>
            </div>
          )}

          {/* Metadata */}
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
              <Label className="text-xs font-semibold text-edulytics-text">Marks</Label>
              <Input
                type="number"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
                min="0"
                step="0.5"
                className="h-9 border-edulytics-border"
              />
            </div>
          </div>

          {message && (
            <Alert variant={message.includes('success') ? 'default' : 'destructive'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{message}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSave}
            disabled={!stem || saving}
            className="w-full bg-edulytics-primary hover:bg-edulytics-primary/90 text-white"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Question'}
          </Button>
        </div>
      </ContentCard>
    </AppShell>
  );
}
