import type { Metadata, Viewport } from 'next';
import '@/styles/globals.css';
import { ToastContainer } from '@/components/common/ToastContainer';
import { NetworkStatusBanner } from '@/components/common/NetworkStatusBanner';
import { PWARegistration } from '@/components/common/PWARegistration';
import { VoiceModal } from '@/features/voice/VoiceModal';
import { CameraModal } from '@/features/camera/CameraModal';

export const metadata: Metadata = {
  title: 'OM AI Assistant — Think. Talk. See. Act. Achieve.',
  description:
    'A next-generation multimodal personal AI assistant combining real-time voice conversations, camera vision, screen sharing, file parsing, code sandboxes, and data analytics.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0B0F17',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen flex flex-col overflow-hidden">
        <PWARegistration />
        <NetworkStatusBanner />
        {children}
        <ToastContainer />
        <VoiceModal />
        <CameraModal />
      </body>
    </html>
  );
}
