export interface TaskStatus {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  position: number;
  isSystem: boolean;
}

export type TaskPriority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Task {
  id: string;
  workspaceId: string;
  boardId: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  position: number;
  dueDate: string | null;
  assigneeId: string | null;
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
  creatorId: string;
  creator?: { id: string; name: string; avatarUrl: string | null };
  parentId: string | null;
  statusId: string;
  status: TaskStatus;
  labels?: { label: { id: string; name: string; color: string } }[];
  _count?: { subTasks: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  statusId: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string;
  statusId?: string;
  priority?: TaskPriority;
  dueDate?: string;
  assigneeId?: string;
}