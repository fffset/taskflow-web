'use client';

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
  return (
    <div className="flex">
      <Sidebar workspaceId={workspaceId} />

      <div className="flex-1 min-w-0">
        <header className="h-14 border-b flex items-center justify-between px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
          <Breadcrumb workspaceId={workspaceId} projectId={projectId} boardId={boardId} />
          <UserMenu />
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
}