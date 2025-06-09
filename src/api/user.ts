import API from './index';
import type { Role } from './role';
import type { RoleDistributionItem } from '../pages/admin/Dashboard';
import type { jadwalUser } from './jadwal_user';
import type { UserAnswer } from './user_answer';

export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  role: Role;
  role_id: number;
  profile: File | null;
  profile_name: string | null;
  profile_path: string | null;
  gender: string | null;
  tanggal_lahir: string | null;
  tahun_masuk: string | null;
  address: string | null;
  jadwal_user: jadwalUser[];
  answers: UserAnswer[];
}

export async function fetchUsers(): Promise<User[]> {
  const response = await API.get("/users");
  return response.data;
}

export async function deleteUser(id: number) {
  return API.delete(`/users/${id}`);
}

// export async function updateUser(id: number, data: Partial<User>) {
//   const response = await API.put(`/users/${id}`, data);
//   return response.data;
// }

export async function updateUser(id: number, data: {
  name: string;
  email: string;
  role_id: number;
  profile?: File | null;
  gender?: string | null;
  tanggal_lahir?: string | null;
  tahun_masuk?: string | null;
  address?: string | null;
}) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("role_id", data.role_id.toString());

  if (data.profile) {
    formData.append("profile", data.profile);
  }

  if (data.gender) {
    formData.append("gender", data.gender);
  }

  if (data.tanggal_lahir) {
    formData.append("tanggal_lahir", data.tanggal_lahir);
  }

  if (data.tahun_masuk) {
    formData.append("tahun_masuk", data.tahun_masuk);
  }

  if (data.address) {
    formData.append("address", data.address);
  }

  formData.append("_method", "PUT");

  const response = await API.post(`/users/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

// export async function createUser(data: Omit<User, "id" | "created_at" | "updated_at" | "role">) {
//   const response = await API.post("/users", data);
//   return response.data;
// }

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: number;
  profile?: File | null;
  gender?: string | null;
  tanggal_lahir?: string | null;
  tahun_masuk?: string | null;
  address?: string | null;
}) {
  const formData = new FormData();
  formData.append("name", data.name);
  formData.append("email", data.email);
  formData.append("role_id", data.role_id.toString());
  formData.append("password", data.password);
  formData.append("password_confirmation", data.password_confirmation);

  if (data.profile) {
    formData.append("profile", data.profile);
  }

  if (data.gender) {
    formData.append("gender", data.gender);
  }

  if (data.tanggal_lahir) {
    formData.append("tanggal_lahir", data.tanggal_lahir);
  }

  if (data.tahun_masuk) {
    formData.append("tahun_masuk", data.tahun_masuk);
  }

  if (data.address) {
    formData.append("address", data.address);
  }

  const response = await API.post("/users", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
}

export async function fetchGurus(): Promise<User[]> {
  const response = await API.get("/guru");
  return response.data;
}

export async function fetchSiswas(): Promise<User[]> {
  const response = await API.get("/siswa");
  return response.data;
}

export const getUserProfile = async () => {
  const { data } = await API.get("/user");
  return data;
};

export const updateProfile = async (payload: { name: string }) => {
  const { data } = await API.put("/profile", payload);
  return data;
};

export async function updatePassword(data: {
  current_password: string;
  password: string;
  password_confirmation: string;
}) {
  const res = await API.put('/update-password', data);
  return res.data;
}

interface UsersCountResponse {
  totalUsers: number;
  totalGuru: number;
  totalAdmin: number;
  totalSiswa: number;
}

export async function fetchUsersCount(): Promise<UsersCountResponse> {
  const res = await API.get("/users/count");
  return res.data;
}

export async function fetchRoleDistribution(): Promise<RoleDistributionItem[]> {
  const res = await API.get("/roles/distribution");
  return res.data;
}

export async function fetchUsersBySchedule(id: number): Promise<jadwalUser[]> {
  const res = await API.get(`/users/jadwal/${id}`);
  return res.data;
}

export async function fetchUsersByIdAll(id: number): Promise<User> {
  const res = await API.get(`/users/all/${id}`);
  return res.data;
} 