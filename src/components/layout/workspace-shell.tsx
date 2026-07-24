'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Sidebar } from '@/components/layout/sidebar';
import { UserMenu } from '@/components/layout/user-menu';
import { Breadcrumb } from '@/components/layout/breadcrumb';

interface WorkspaceShellProps {
  workspaceId: string;
  projectId?: string;
  boardId?: string;
  children: React.ReactNode;
}

export function WorkspaceShell({
  workspaceId,
  projectId,
  boardId,
  children,
}: WorkspaceShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex">
      {/* Masaüstü — genişlik ve pozisyon burada, Sidebar'ın kendisinde değil */}
      <div className="hidden md:block w-64 h-screen sticky top-0 shrink-0">
        <Sidebar workspaceId={workspaceId} />
      </div>

      {/* Mobil — hamburger ile açılan kayar panel, genişliği SheetContent belirler */}
      <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <Sidebar workspaceId={workspaceId} onNavigate={() => setMobileSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-4 md:px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden shrink-0"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="min-w-0 overflow-hidden">
              <Breadcrumb workspaceId={workspaceId} projectId={projectId} boardId={boardId} />
            </div>
          </div>
          <UserMenu />
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}
