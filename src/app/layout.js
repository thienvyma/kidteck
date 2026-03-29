import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata = {
  title: "KidTech — Vibe Coding Academy | Dạy lập trình AI cho học sinh",
  description:
    "Khóa học Vibe Coding cho học sinh từ 15 tuổi. Tạo App thật chỉ bằng lời nói với Cursor, Claude Code. Không cần biết code truyền thống.",
  keywords: "vibe coding, học lập trình, AI coding, kidtech, cursor, claude code, học sinh",
  openGraph: {
    title: "KidTech — Vibe Coding Academy",
    description: "Tạo App thật chỉ bằng lời nói — Không cần biết code",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
