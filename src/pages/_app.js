// src/pages/_app.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import Navigation from '@/components/layout/Navigation';
import '@/styles/globals.css';
import dynamic from 'next/dynamic';

// Dynamically import with no SSR
const GoogleOAuthProvider = dynamic(
  () => import('@react-oauth/google').then(mod => mod.GoogleOAuthProvider),
  { ssr: false }
);

function SafeHydrate({ children }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    return null;
  }
  
  return (
    <>
      {children}
    </>
  );
}

export default function App({ Component, pageProps }) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  return (
    <>
      <Head>
        <title>Rahoot - Interactive Quiz Platform</title>
        <meta name="description" content="Create and join interactive quizzes with Rahoot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <SafeHydrate>
        {isMounted ? (
          <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
            <AuthProvider>
              <SocketProvider>
                <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <Navigation />
                  <main className="container mx-auto px-4 py-8">
                    <Component {...pageProps} />
                  </main>
                  <Toaster position="top-right" />
                </div>
              </SocketProvider>
            </AuthProvider>
          </GoogleOAuthProvider>
        ) : (
          <AuthProvider>
            <SocketProvider>
              <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                  <Component {...pageProps} />
                </main>
                <Toaster position="top-right" />
              </div>
            </SocketProvider>
          </AuthProvider>
        )}
      </SafeHydrate>
    </>
  );
}