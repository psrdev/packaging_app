import client from './client';
import { User } from '../types';

export interface LoginResponse {
  token: string;
  user: User;
}

export const login = async (payload: Record<string, string>): Promise<LoginResponse> => {
  const response = await client.post('/login', payload);
  return response.data;
};

export const logout = async (): Promise<void> => {
  await client.post('/logout');
};

export const getMe = async (): Promise<User> => {
  const response = await client.get('/me');
  return response.data;
};
