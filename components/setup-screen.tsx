'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Database, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

interface SetupScreenProps {
  onSetupComplete: () => void;
}

interface StatusData {
  hasMongoUri: boolean;
  hasAppPassword: boolean;
  dbConnected: boolean;
  dbHasData: boolean;
  connectionError: string | null;
}

export function SetupScreen({ onSetupComplete }: SetupScreenProps) {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<StatusData | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      setStatus(data);

      if (data.dbConnected && data.dbHasData) {
        setTimeout(() => {
          onSetupComplete();
        }, 500);
      } else if (data.connectionError) {
        setError(data.connectionError);
      }
    } catch (err) {
      setError('Error checking system status');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading && !status) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Checking system status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Database className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <CardDescription>
            {status?.dbConnected && !status?.dbHasData
              ? 'Database connected but needs initialization'
              : !status?.hasMongoUri
              ? 'MongoDB connection not configured'
              : !status?.dbConnected
              ? 'Cannot connect to MongoDB'
              : 'Checking database status...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <h3 className="font-semibold text-sm">System Status</h3>
            <div className="space-y-2 text-sm font-mono">
              <div className="flex items-center justify-between">
                <span>MONGODB_URI</span>
                <span className="text-muted-foreground">
                  {status?.hasMongoUri ? '✓ Set' : '✗ Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>APP_PASSWORD</span>
                <span className="text-muted-foreground">
                  {status?.hasAppPassword ? '✓ Set' : '✗ Not set'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Connection</span>
                <span className="text-muted-foreground">
                  {status?.dbConnected ? '✓ Connected' : '✗ Not connected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Data</span>
                <span className="text-muted-foreground">
                  {status?.dbHasData ? '✓ Has data' : '✗ Empty'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {!status?.hasMongoUri && (
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">To configure the database:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Add MONGODB_URI to your environment variables</li>
                  <li>Restart the application</li>
                  <li>Return here to initialize the database</li>
                </ol>
              </div>
            )}

            {status?.hasMongoUri && status?.dbConnected && !status?.dbHasData && (
              <div className="text-sm text-muted-foreground">
                <p>Database is connected but empty. Click "Seed Database" to initialize with sample data.</p>
              </div>
            )}

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
            {status?.dbConnected && !status?.dbHasData && (
              <Button
                onClick={handleSeed}
                disabled={seeding || success}
                className="flex-1"
              >
                {seeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Seeding...
                  </>
                ) : (
                  'Seed Database'
                )}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onSetupComplete}
              disabled={seeding}
              className={!status?.dbConnected || status?.dbHasData ? 'flex-1' : ''}
            >
              {status?.dbHasData ? 'Continue' : 'Skip (Use without DB)'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
