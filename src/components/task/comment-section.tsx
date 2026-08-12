'use client';

import { useState } from 'react';
import { Send, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/use-comment';
import { useAuthStore } from '@/store/auth.store';

interface CommentSectionProps {
  workspaceId: string;
  taskId: string;
}

// Mention'lar backend'de @[isim](userId) formatında saklanıyor —
// kullanıcıya gösterirken bunu okunabilir @isim'e çeviriyoruz.
function renderContent(content: string): string {
  return content.replace(/@\[([^\]]+)\]\([^)]+\)/g, '@$1');
}

export function CommentSection({ workspaceId, taskId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const currentUser = useAuthStore((s) => s.user);
  const { data: comments, isLoading } = useComments(workspaceId, taskId);
  const { mutate: createComment, isPending: isCreating } = useCreateComment(workspaceId, taskId);
  const { mutate: updateComment } = useUpdateComment(workspaceId, taskId);
  const { mutate: deleteComment } = useDeleteComment(workspaceId, taskId);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    createComment(
      { content: newComment.trim() },
      { onSuccess: () => setNewComment('') },
    );
  };

  const startEdit = (id: string, content: string) => {
    setEditingId(id);
    setEditContent(renderContent(content));
  };

  const saveEdit = () => {
    if (!editingId || !editContent.trim()) return;
    updateComment(
      { commentId: editingId, payload: { content: editContent.trim() } },
      { onSuccess: () => setEditingId(null) },
    );
  };

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium">Yorumlar {comments && `(${comments.length})`}</p>

      {isLoading ? (
        <p className="text-xs text-muted-foreground">Yükleniyor...</p>
      ) : comments?.length === 0 ? (
        <p className="text-xs text-muted-foreground">Henüz yorum yok</p>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {comments?.map((comment) => {
            const isOwn = comment.authorId === currentUser?.id;

            return (
              <div key={comment.id} className="flex gap-2">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium shrink-0">
                  {comment.author.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{comment.author.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  {editingId === comment.id ? (
                    <div className="mt-1 space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={2}
                        className="text-sm"
                      />
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={saveEdit}>
                          <Check className="w-3.5 h-3.5 mr-1" />
                          Kaydet
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          <X className="w-3.5 h-3.5 mr-1" />
                          Vazgeç
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                      {renderContent(comment.content)}
                    </p>
                  )}
                </div>

                {isOwn && editingId !== comment.id && (
                  <div className="flex items-start gap-0.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-6 h-6"
                      onClick={() => startEdit(comment.id, comment.content)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-6 h-6 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Yorum silinsin mi?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bu işlem geri alınamaz.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteComment(comment.id)}
                            className="bg-destructive text-white hover:bg-destructive/90"
                          >
                            Sil
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Yorum ekle..."
          rows={2}
          className="text-sm"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              handleSubmit();
            }
          }}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!newComment.trim() || isCreating}
          className="shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}