'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { X, RotateCcw, Clock } from 'lucide-react';

interface QuestionRevision {
  _id: string;
  questionId: string;
  before: any;
  after: any;
  editedAt: string;
  editedBy: string;
  revertedFrom?: string;
}

interface QuestionHistoryProps {
  questionId: string;
  onClose: () => void;
  onRevert: (revisionId: string) => void;
}

export function QuestionHistory({ questionId, onClose, onRevert }: QuestionHistoryProps) {
  const [revisions, setRevisions] = useState<QuestionRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [reverting, setReverting] = useState<string | null>(null);

  useEffect(() => {
    loadRevisions();
  }, [questionId]);

  const loadRevisions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/questions/${questionId}/revisions`);
      const data = await response.json();
      setRevisions(data.revisions || []);
    } catch (error) {
      console.error('Error loading revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevert = async (revisionId: string) => {
    if (!confirm('Are you sure you want to revert to this version?')) return;

    setReverting(revisionId);
    try {
      const response = await fetch(`/api/questions/${questionId}/revert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to revert');
      }

      onRevert(revisionId);
    } catch (error) {
      console.error('Error reverting:', error);
      alert('Failed to revert question');
    } finally {
      setReverting(null);
    }
  };

  const getChangeSummary = (before: any, after: any) => {
    const changes: string[] = [];
    
    if (before.stem !== after.stem) changes.push('stem');
    if (before.stimulus !== after.stimulus) changes.push('stimulus');
    if (before.difficulty !== after.difficulty) changes.push('difficulty');
    if (before.marks !== after.marks) changes.push('marks');
    if (JSON.stringify(before.options) !== JSON.stringify(after.options)) changes.push('options');
    if (JSON.stringify(before.parts) !== JSON.stringify(after.parts)) changes.push('parts');
    
    return changes.length > 0 ? changes.join(', ') : 'no changes';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <h2 className="text-lg font-bold">Revision History</h2>
          </div>
          <Button size="sm" variant="outline" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="flex-1 p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-edulytics-primary mx-auto"></div>
              <p className="text-sm mt-3">Loading history...</p>
            </div>
          ) : revisions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No revision history available</p>
            </div>
          ) : (
            <div className="space-y-4">
              {revisions.map((revision, index) => (
                <div key={revision._id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={index === 0 ? 'default' : 'outline'}>
                          {index === 0 ? 'Latest' : `Version ${revisions.length - index}`}
                        </Badge>
                        {revision.revertedFrom && (
                          <Badge variant="secondary" className="text-xs">
                            Reverted
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(revision.editedAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        By: {revision.editedBy}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRevert(revision._id)}
                      disabled={index === 0 || reverting === revision._id}
                    >
                      {reverting === revision._id ? (
                        'Reverting...'
                      ) : (
                        <>
                          <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                          Revert to this
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-sm">
                    <p className="font-semibold text-gray-700 mb-1">Changes:</p>
                    <p className="text-gray-600">{getChangeSummary(revision.before, revision.after)}</p>
                  </div>

                  {/* Show key differences */}
                  <div className="mt-3 space-y-2 text-xs">
                    {revision.before.stem !== revision.after.stem && (
                      <div className="p-2 bg-gray-100 rounded">
                        <p className="font-semibold mb-1">Stem changed</p>
                        <p className="text-gray-600 line-through">{revision.before.stem.substring(0, 100)}...</p>
                        <p className="text-green-600">{revision.after.stem.substring(0, 100)}...</p>
                      </div>
                    )}
                    {revision.before.difficulty !== revision.after.difficulty && (
                      <div className="p-2 bg-gray-100 rounded">
                        <p className="font-semibold mb-1">Difficulty changed</p>
                        <p>
                          <span className="text-gray-600 line-through">{revision.before.difficulty || 'none'}</span>
                          {' → '}
                          <span className="text-green-600">{revision.after.difficulty}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
