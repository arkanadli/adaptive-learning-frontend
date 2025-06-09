import axios from 'axios';
import type { User } from '@/api/user';
import API from './index';

const API_ALL = axios.create({
  baseURL: 'http://adaptive-learning-alb-755424169.ap-southeast-2.elb.amazonaws.com/api'
});

let authToken: string | null = null;
console.log(authToken);
export const setAuthToken = (token: string) => {
  authToken = token;
  API_ALL.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const login = async (
  data: { email: string; password: string },
  setUser: (user: User) => void
) => {
  try {
    const res = await API_ALL.post('/login', data);
    const token = res.data.access_token;

    setAuthToken(token);
    localStorage.setItem('token', token);
    
    const user = res.data.user;

    localStorage.setItem('user', JSON.stringify(user));

    setUser(user);

    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const register = async (data: { name: string; email: string; password: string;  password_confirmation: string; role_id: number; }) => {
  try {
    const res = await API_ALL.post('/register', data);
    const token = res.data.token;
    setAuthToken(token);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const forgotPassword = async (data: { email: string }) => {
  try {
    const res = await API_ALL.post('/forgot-password', data);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const resetPassword = async (data: {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}) => {
  try {
    const res = await API_ALL.post('/reset-password', data);
    return res.data;
  } catch (err: any) {
    throw err;
  }
};

export const logout = async () => {
  try {
    await API.post('/logout');
    localStorage.clear();
  } catch (err) {
    console.error('Logout error (ignored):', err);
  } finally {
    authToken = null;
    delete API_ALL.defaults.headers.common['Authorization'];
    localStorage.clear();
  }
};