'use client';

import { useState, useEffect } from 'react';
import { Question, QuestionSolution } from '@/lib/types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { X, Plus, Trash2, Save, ArrowUp, ArrowDown, Eye, History } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import dynamic from 'next/dynamic';

const InlineMath = dynamic(() => import('react-katex').then(mod => mod.InlineMath), { ssr: false });
const BlockMath = dynamic(() => import('react-katex').then(mod => mod.BlockMath), { ssr: false });

interface QuestionEditFormProps {
  question: Question;
  onClose: () => void;
  onSave: (question: Question) => void;
  onViewHistory?: () => void;
}

export function QuestionEditForm({ question, onClose, onSave, onViewHistory }: QuestionEditFormProps) {
  const [formData, setFormData] = useState<any>({
    type: question.type,
    language: question.language,
    stem: question.stem,
    stimulus: question.stimulus || '',
    mcqKind: question.mcqKind,
    difficulty: question.difficulty,
    marks: question.marks,
    options: question.options || [],
    statements: question.statements || [],
    parts: question.parts || [],
  });

  const [solutions, setSolutions] = useState<QuestionSolution[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSolutions();
  }, []);

  const loadSolutions = async () => {
    try {
      const response = await fetch(`/api/solutions?questionId=${question._id.toString()}`);
      const data = await response.json();
      setSolutions(data.solutions || []);
    } catch (error) {
      console.error('Error loading solutions:', error);
    }
  };

  const renderMarkdownPreview = (text: string) => {
    const parts = text.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index}>{math}</BlockMath>;
      } else if (part.startsWith('$') && part.endsWith('$')) {
        const math = part.slice(1, -1);
        return <InlineMath key={index}>{math}</InlineMath>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/questions/${question._id.toString()}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save question');
      }

      const data = await response.json();
      onSave(data.question);
    } catch (error) {
      console.error('Error saving question:', error);
      alert('Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const addOption = () => {
    const nextKey = String.fromCharCode(65 + formData.options.length); // A, B, C, D...
    setFormData({
      ...formData,
      options: [...formData.options, { key: nextKey, text: '' }],
    });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_: any, i: number) => i !== index),
    });
  };

  const updateOption = (index: number, field: string, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  const addPart = () => {
    const banglaKeys = ['ক', 'খ', 'গ', 'ঘ', 'ঙ'];
    const nextKey = banglaKeys[formData.parts.length] || String(formData.parts.length + 1);
    setFormData({
      ...formData,
      parts: [...formData.parts, { key: nextKey, prompt: '', marks: 0 }],
    });
  };

  const removePart = (index: number) => {
    setFormData({
      ...formData,
      parts: formData.parts.filter((_: any, i: number) => i !== index),
    });
  };

  const updatePart = (index: number, field: string, value: any) => {
    const newParts = [...formData.parts];
    newParts[index] = { ...newParts[index], [field]: value };
    setFormData({ ...formData, parts: newParts });
  };

  const movePart = (index: number, direction: 'up' | 'down') => {
    const newParts = [...formData.parts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newParts.length) return;
    
    [newParts[index], newParts[targetIndex]] = [newParts[targetIndex], newParts[index]];
    setFormData({ ...formData, parts: newParts });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold">Edit Question</h2>
            <Badge>{formData.type.toUpperCase()}</Badge>
          </div>
          <div className="flex items-center gap-2">
            {onViewHistory && (
              <Button size="sm" variant="outline" onClick={onViewHistory}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
            )}
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Form */}
          <ScrollArea className="flex-1 p-6 border-r">
            <div className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mcq">MCQ</SelectItem>
                      <SelectItem value="cq">Creative (CQ)</SelectItem>
                      <SelectItem value="sq">Short</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Language</Label>
                  <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="bn">বাংলা</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Marks</Label>
                  <Input
                    type="number"
                    value={formData.marks || ''}
                    onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) || undefined })}
                  />
                </div>

                {formData.type === 'mcq' && (
                  <div>
                    <Label>MCQ Kind</Label>
                    <Select value={formData.mcqKind} onValueChange={(v) => setFormData({ ...formData, mcqKind: v })}>
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

              {/* Question Stem */}
              <div>
                <Label>Question Stem (use $...$ for inline math, $$...$$ for block)</Label>
                <Textarea
                  value={formData.stem}
                  onChange={(e) => setFormData({ ...formData, stem: e.target.value })}
                  rows={4}
                  className={formData.language === 'bn' ? 'font-bengali' : ''}
                />
              </div>

              {/* Stimulus for CQ */}
              {formData.type === 'cq' && (
                <div>
                  <Label>Stimulus</Label>
                  <Textarea
                    value={formData.stimulus}
                    onChange={(e) => setFormData({ ...formData, stimulus: e.target.value })}
                    rows={6}
                    className={formData.language === 'bn' ? 'font-bengali' : ''}
                  />
                </div>
              )}

              {/* MCQ Options */}
              {formData.type === 'mcq' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Options</Label>
                    <Button size="sm" variant="outline" onClick={addOption}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Option
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {formData.options.map((opt: any, idx: number) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          value={opt.key}
                          onChange={(e) => updateOption(idx, 'key', e.target.value)}
                          className="w-16"
                          placeholder="A"
                        />
                        <Input
                          value={opt.text}
                          onChange={(e) => updateOption(idx, 'text', e.target.value)}
                          className="flex-1"
                          placeholder="Option text"
                        />
                        <Button size="sm" variant="ghost" onClick={() => removeOption(idx)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* CQ Parts */}
              {formData.type === 'cq' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Parts</Label>
                    <Button size="sm" variant="outline" onClick={addPart}>
                      <Plus className="h-3.5 w-3.5 mr-1" />
                      Add Part
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {formData.parts.map((part: any, idx: number) => (
                      <div key={idx} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center gap-2">
                          <Input
                            value={part.key}
                            onChange={(e) => updatePart(idx, 'key', e.target.value)}
                            className="w-16"
                          />
                          <Input
                            type="number"
                            value={part.marks}
                            onChange={(e) => updatePart(idx, 'marks', parseInt(e.target.value))}
                            className="w-20"
                            placeholder="Marks"
                          />
                          <div className="flex-1" />
                          <Button size="sm" variant="ghost" onClick={() => movePart(idx, 'up')} disabled={idx === 0}>
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => movePart(idx, 'down')} disabled={idx === formData.parts.length - 1}>
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => removePart(idx)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          value={part.prompt}
                          onChange={(e) => updatePart(idx, 'prompt', e.target.value)}
                          rows={2}
                          placeholder="Part prompt"
                          className={formData.language === 'bn' ? 'font-bengali' : ''}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Right Panel - Live Preview */}
          <div className="w-1/2 bg-gray-50 p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <Eye className="h-4 w-4" />
              <h3 className="font-semibold">Live Preview</h3>
            </div>
            
            <div className="bg-white border rounded-lg p-6 space-y-4">
              <div className="flex gap-2 mb-4">
                <Badge>{formData.type.toUpperCase()}</Badge>
                {formData.difficulty && <Badge variant="outline">{formData.difficulty}</Badge>}
                {formData.marks && <Badge variant="outline">{formData.marks} marks</Badge>}
              </div>

              <div className={formData.language === 'bn' ? 'font-bengali' : ''}>
                <p className="font-semibold text-sm mb-2">Question:</p>
                <div className="text-sm">{renderMarkdownPreview(formData.stem)}</div>
              </div>

              {formData.stimulus && (
                <div className={formData.language === 'bn' ? 'font-bengali' : ''}>
                  <p className="font-semibold text-sm mb-2">Stimulus:</p>
                  <div className="text-sm whitespace-pre-wrap bg-gray-50 p-3 rounded">
                    {renderMarkdownPreview(formData.stimulus)}
                  </div>
                </div>
              )}

              {formData.options && formData.options.length > 0 && (
                <div className={formData.language === 'bn' ? 'font-bengali' : ''}>
                  <p className="font-semibold text-sm mb-2">Options:</p>
                  <div className="space-y-1">
                    {formData.options.map((opt: any) => (
                      <div key={opt.key} className="flex gap-2 text-sm">
                        <span className="font-semibold">{opt.key}.</span>
                        <span>{renderMarkdownPreview(opt.text)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.parts && formData.parts.length > 0 && (
                <div className={formData.language === 'bn' ? 'font-bengali' : ''}>
                  <p className="font-semibold text-sm mb-2">Parts:</p>
                  <div className="space-y-2">
                    {formData.parts.map((part: any) => (
                      <div key={part.key} className="text-sm">
                        <span className="font-semibold">{part.key}. </span>
                        <span>{renderMarkdownPreview(part.prompt)}</span>
                        {part.marks && (
                          <span className="text-xs text-gray-500 ml-2">({part.marks} marks)</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
