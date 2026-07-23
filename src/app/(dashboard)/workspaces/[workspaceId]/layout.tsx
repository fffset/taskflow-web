'use client';

import { use } from 'react';
import { usePathname, notFound } from 'next/navigation';
import { WorkspaceShell } from '@/components/layout/workspace-shell';
import { useWorkspace } from '@/hooks/use-workspace';

export default function WorkspaceLayout({
  params,
  children,
}: {
  params: Promise<{ workspaceId: string }>;
  children: React.ReactNode;
}) {
  const { workspaceId } = use(params);
  const pathname = usePathname();

  const { isLoading, isError } = useWorkspace(workspaceId);

  const projectMatch = /projects\/([^/]+)/.exec(pathname);
  const boardMatch = /boards\/([^/]+)/.exec(pathname);

  // Workspace geçersizse (yok, veya bu kullanıcı üyesi değil) gerçek bir
  // 404 sayfası göster — boş bir kabuk render etmek yerine.
  if (isError) {
    notFound();
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

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