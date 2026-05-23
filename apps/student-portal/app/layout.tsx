import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Atria Admission Portal — Student',
  description: 'Apply for admission at Atria Institute of Technology, Bangalore.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
