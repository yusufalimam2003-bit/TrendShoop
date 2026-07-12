import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata = {
  title: 'TrendShoop',
  description: 'كل المتاجر، بمكان وحد',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;800;900&family=Tajawal:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
