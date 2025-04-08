// src/pages/_app.js
import { useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { SocketProvider } from '@/contexts/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navigation from '@/components/layout/Navigation';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Rahoot - Interactive Quiz Platform</title>
        <meta name="description" content="Create and join interactive quizzes with Rahoot" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
        <ThemeProvider>
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
        </ThemeProvider>
      </GoogleOAuthProvider>
    </>
  );
}