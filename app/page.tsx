'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PasswordGate } from '@/components/password-gate';
import { SetupScreen } from '@/components/setup-screen';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = localStorage.getItem('app_authenticated');
    if (checkAuth === 'true') {
      setAuthenticated(true);
    }

    const checkSetup = async () => {
      try {
        const response = await fetch('/api/db/check');
        const data = await response.json();
        if (data.connected) {
          setSetupComplete(true);
        }
      } catch (error) {
        console.error('Setup check error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (checkAuth === 'true') {
      checkSetup();
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated && setupComplete && !loading) {
      router.push('/curriculum');
    }
  }, [authenticated, setupComplete, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authenticated) {
    return <PasswordGate onAuthenticated={() => setAuthenticated(true)} />;
  }

  if (!setupComplete) {
    return <SetupScreen onSetupComplete={() => setSetupComplete(true)} />;
  }

  return null;
}
