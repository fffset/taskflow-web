export interface Label {
  id: string;
  projectId: string;
  name: string;
  color: string;
}

export interface CreateLabelPayload {
  name: string;
  color?: string;
}

export interface UpdateLabelPayload {
  name?: string;
  color?: string;
}
