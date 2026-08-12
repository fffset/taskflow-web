export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  author: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}
