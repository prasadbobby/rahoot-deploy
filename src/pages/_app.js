// src/pages/_app.js
import { useEffect, useState } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
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
  
  return <>{children}</>;
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
        <ThemeProvider>
          {isMounted ? (
            <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
              <AuthProvider>
                <SocketProvider>
                  <Component {...pageProps} />
                  <Toaster 
                    position="top-right" 
                    toastOptions={{
                      style: {
                        background: '#fff',
                        color: '#333',
                        boxShadow: '0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05)',
                        fontWeight: 500,
                        padding: '16px',
                        borderRadius: '8px',
                      },
                      success: {
                        iconTheme: {
                          primary: '#4ade80',
                          secondary: '#fff',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff',
                        },
                      },
                    }}
                  />
                </SocketProvider>
              </AuthProvider>
            </GoogleOAuthProvider>
          ) : (
            <AuthProvider>
              <SocketProvider>
                <Component {...pageProps} />
                <Toaster position="top-right" />
              </SocketProvider>
            </AuthProvider>
          )}
        </ThemeProvider>
      </SafeHydrate>
    </>
  );
}