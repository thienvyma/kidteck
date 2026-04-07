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
  title: "AIgenlabs — Nền tảng học AI & Product Mindset cho học sinh 12-17 tuổi",
  description:
    "Không chỉ là Vibe Coding hay Prompt. AIgenlabs rèn luyện tư duy điều phối, giải quyết vấn đề và làm chủ công nghệ AI (Cursor, Claude, Antigravity) để tạo dự án thật.",
  keywords: "học lập trình ai, product mindset, vibe coding, aigenlabs, cursor, claude code, antigravity, học sinh 12-17 tuổi",
  openGraph: {
    title: "AIgenlabs — Nền tảng học AI & Product Mindset",
    description: "Giúp học viên 12-17 tuổi chuyển từ tiêu thụ màn hình ngắn sang học sâu, xây dựng sản phẩm thật.",
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
