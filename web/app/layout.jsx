import "./globals.css";

export const metadata = {
  title: "LoLdle",
  description: "Guess the League of Legends champion",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
