'use client';

import React from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { ScreenShareBanner } from '@/features/screen-share/ScreenShareBanner';
import { ChatArea } from '@/components/chat/ChatArea';
import { CodeWorkspace } from '@/features/coding/CodeWorkspace';
import { DataWorkspace } from '@/features/data/DataWorkspace';
import { NotebookWorkspace } from '@/features/notebook/NotebookWorkspace';
import { ImageGenWorkspace } from '@/features/image-generation/ImageGenWorkspace';
import { VideoGenWorkspace } from '@/features/video-generation/VideoGenWorkspace';
import { PermissionsCenter } from '@/features/permissions/PermissionsCenter';
import { SettingsWorkspace } from '@/features/settings/SettingsModal';
import { HelpWorkspace } from '@/features/help/HelpWorkspace';

export default function HomePage() {
  const { activeTab } = useUIStore();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative">
        <Header />
        <ScreenShareBanner />

        {/* Dynamic Workspace Container */}
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activeTab === 'chat' && <ChatArea />}
          {activeTab === 'coding' && <CodeWorkspace />}
          {activeTab === 'data' && <DataWorkspace />}
          {activeTab === 'notebook' && <NotebookWorkspace />}
          {activeTab === 'image' && <ImageGenWorkspace />}
          {activeTab === 'video' && <VideoGenWorkspace />}
          {activeTab === 'permissions' && <PermissionsCenter />}
          {activeTab === 'settings' && <SettingsWorkspace />}
          {activeTab === 'help' && <HelpWorkspace />}
        </main>
      </div>
    </div>
  );
}
