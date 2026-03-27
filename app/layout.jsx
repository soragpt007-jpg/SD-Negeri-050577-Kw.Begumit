import './globals.css';

export const metadata = {
  title: 'SDN 050577 - Website Resmi & PPDB',
  description: 'Website resmi SD Negeri 050577 beserta sistem Penerimaan Peserta Didik Baru (PPDB) online terpadu.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}