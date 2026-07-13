import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import { Analytics } from '@vercel/analytics/react';

export const metadata = {
  title: 'TrendShoop',
  description: 'كل المتاجر، بمكان واحد',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}