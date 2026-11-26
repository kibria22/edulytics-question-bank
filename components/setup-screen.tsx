'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SetupScreenProps {
  onSetupComplete: () => void;
}

export function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSeed = async () => {
    setSeeding(true);
    setError('');
    setSuccess(false);

    try {
      const response = await fetch('/api/seed', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onSetupComplete();
        }, 1500);
      } else {
        setError(data.error || 'Failed to seed database');
      }
    } catch (err) {
      setError('Error seeding database');
    } finally {
      setSeeding(false);
    }
  };

  const handleTestConnection = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/db/check');
      const data = await response.json();

      if (data.connected) {
        setError('');
        await handleSeed();
      } else {
        setError('Cannot connect to MongoDB. Please check your MONGODB_URI environment variable.');
      }
    } catch (err) {
      setError('Error checking database connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Database Setup Required</CardTitle>
          <CardDescription>
            MongoDB connection is not configured or the database needs seeding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-sm">Environment Variables</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center justify-between">
                <span>MONGODB_URI</span>
                <span className="text-muted-foreground">
                  {process.env.MONGODB_URI ? '✓ Set' : '✗ Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>APP_PASSWORD</span>
                <span className="text-muted-foreground">
                  {process.env.APP_PASSWORD ? '✓ Set' : '✗ Not set'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p className="mb-2">To set up the application:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Add MONGODB_URI to your .env.local file</li>
                <li>Restart the development server</li>
                <li>Click "Seed Database" to initialize with sample data</li>
              </ol>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>Database seeded successfully! Redirecting...</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleTestConnection}
              disabled={loading || seeding || success}
              className="flex-1"
            >
              {loading || seeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {seeding ? 'Seeding...' : 'Checking...'}
                </>
              ) : (
                'Seed Database'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={onSetupComplete}
              disabled={loading || seeding}
            >
              Skip (Use without DB)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
