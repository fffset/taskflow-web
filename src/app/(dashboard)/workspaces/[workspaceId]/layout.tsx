'use client';

import { use } from 'react';
import { usePathname } from 'next/navigation';
import { WorkspaceShell } from '@/components/layout/workspace-shell';

export default function WorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ workspaceId: string }>;
  children: React.ReactNode;
}) {
  const { workspaceId } = use(params);
  const pathname = usePathname();

  const projectMatch = /projects\/([^/]+)/.exec(pathname);
  const boardMatch = /boards\/([^/]+)/.exec(pathname);

  return (
    <WorkspaceShell
      workspaceId={workspaceId}
      projectId={projectMatch?.[1]}
      boardId={boardMatch?.[1]}
    >
      {children}
    </WorkspaceShell>
  );
}