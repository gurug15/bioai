import { apiClient } from "./client";
import type { User } from "@/lib/types";

export const signup = async (data: {
  email: string;
  name?: string;
  password: string;
}): Promise<User> => {
  const response = await apiClient.post<User>("/auth/signup", data);
  return response.data;
};

export const login = async (data: {
  email: string;
  password: string;
}): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>("/auth/login", data);
  return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await apiClient.delete<{ message: string }>("/auth/logout");
  return response.data;
};

export const refreshTokens = async (): Promise<{ message: string }> => {
  const response = await apiClient.post<{ message: string }>("/auth/refresh");
  return response.data;
};

export const getMe = async (): Promise<User> => {
  const response = await apiClient.get<User>("/auth/me");
  return response.data;
};
