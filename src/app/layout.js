import { Inter } from "next/font/google";
import "./globals.css";
import RuntimeCompat from '@/components/ui/RuntimeCompat';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { GoogleAnalytics } from '@next/third-parties/google';

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  metadataBase: new URL('https://aigenlabs.vn'),
  title: "AIgenlabs — Vibe Coding Academy | Dạy lập trình AI cho học sinh",
  description:
    "Khóa học Vibe Coding cho học sinh từ 15 tuổi. Tạo App thật chỉ bằng lời nói với Cursor, Claude Code , antigravity. Không cần biết code truyền thống.",
  keywords: "vibe coding, học lập trình, AI coding, aigenlabs, cursor, claude code, antigravity, học sinh",
  openGraph: {
    title: "AIgenlabs — Vibe Coding Academy",
    description: "Tạo App thật chỉ bằng lời nói — Không cần biết code",
    url: 'https://aigenlabs.vn',
    siteName: 'AIgenlabs',
    locale: 'vi_VN',
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>
        <RuntimeCompat />
        {children}
        <SpeedInsights />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      </body>
    </html>
  );
}
