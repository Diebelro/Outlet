import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diebel – Magazin online',
  description: 'Haine și încălțăminte – geci, pantaloni, tricouri, adidași',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
