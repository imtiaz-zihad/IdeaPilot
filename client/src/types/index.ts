export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

export interface Startup {
  _id: string;
  userId: string;
  startupName: string;
  idea: string;
  industry: string;
  targetAudience: string;
  country: string;
  stage: "idea" | "mvp" | "growth" | "scale";
  investorScore?: number;
  createdAt: string;
}

export interface APIResponse<T> {
  success: boolean;
  message: string;
  data: T;
}