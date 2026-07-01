export interface Board {
  id: string;
  projectId: string;
  name: string;
  position: number;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface CreateBoardPayload {
  name: string;
}