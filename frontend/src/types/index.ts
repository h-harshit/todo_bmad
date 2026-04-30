export interface User {
  id: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  status: "todo" | "in_progress" | "done";
  user_id: string;
  created_at: string;
  updated_at: string;
}
