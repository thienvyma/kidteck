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

const siteTitle = 'AIgenlabs — Project-Based AI Learning for the Next Generation'
const siteDescription =
  'Sự phát triển phi mã của AI đang rút ngắn vòng đời của kiến thức và tái định nghĩa lợi thế cạnh tranh tương lai cho thế hệ gen Z và Alpha. Khác biệt không nằm ở công cụ, mà ở tư duy hệ thống, hiểu rõ bản chất và chọn lọc công cụ phù hợp.'
const siteIcon = '/aigenlabs-meta-icon.png'

export const metadata = {
  metadataBase: new URL('https://aigenlabs.vn'),
  title: siteTitle,
  description: siteDescription,
  applicationName: 'AIgenlabs',
  creator: 'AIgenlabs',
  publisher: 'AIgenlabs',
  keywords:
    'project-based AI learning, AI learning for Gen Z, AI learning for Gen Alpha, học AI theo dự án, tư duy hệ thống, AIgenlabs',
  icons: {
    icon: [{ url: siteIcon, type: 'image/png', sizes: '512x512' }],
    shortcut: [{ url: siteIcon, type: 'image/png', sizes: '512x512' }],
    apple: [{ url: siteIcon, type: 'image/png', sizes: '512x512' }],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: 'https://aigenlabs.vn',
    siteName: 'AIgenlabs',
    images: [
      {
        url: siteIcon,
        width: 512,
        height: 512,
        alt: 'AIgenlabs Logo',
      },
    ],
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: siteTitle,
    description: siteDescription,
    images: [siteIcon],
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
