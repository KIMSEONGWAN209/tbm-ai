import './globals.css';

export const metadata = {
  title: 'TBM AI Clean V2'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
