export interface ProjectStatus {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  position: number;
  isSystem: boolean;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  position: number;
  statusId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
  _count?: { boards: number };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  statusId: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  statusId?: string;
}

export interface CreateProjectStatusPayload {
  name: string;
  color?: string;
}

export interface UpdateProjectStatusPayload {
  name?: string;
  color?: string;
}
