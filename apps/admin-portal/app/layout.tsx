import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atria Admission Admin Portal',
  description: 'Manage applications and admissions.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
