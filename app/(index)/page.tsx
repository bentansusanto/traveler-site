'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// This page only renders when the app is built statically (output: 'export')
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/id');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <p>Redirecting...</p>
    </div>
  );
}
