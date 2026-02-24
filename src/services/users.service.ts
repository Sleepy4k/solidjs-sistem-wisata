import api from "./api.service";

export type UserRole = "admin" | "bumdes" | "pokdarwis" | "pemdes";

export interface IUser {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IUserListParams {
  page?: number;
  per_page?: number;
  search?: string;
  role?: string;
}

export interface IUserListResponse {
  data: IUser[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const BASE = "/dashboard/admin/users";

export const getUsers = async (
  params: IUserListParams,
): Promise<IUserListResponse> => {
  const res = await api.get(BASE, { params });
  const body = res.data;
  const pagination = body?.pagination ?? {};
  return {
    data: body?.data ?? [],
    current_page: pagination.current_page ?? 1,
    last_page: pagination.last_page ?? 1,
    per_page: pagination.per_page ?? params.per_page ?? 10,
    total: pagination.total ?? 0,
    from: pagination.from ?? 0,
    to: pagination.to ?? 0,
  };
};

export const getUserById = async (id: number | string): Promise<IUser> => {
  const res = await api.get(`${BASE}/${id}`);
  return res.data?.data ?? res.data;
};

export const createUser = async (
  payload: Omit<IUser, "id" | "created_at" | "updated_at"> & {
    password: string;
    password_confirmation: string;
  },
): Promise<IUser> => {
  const res = await api.post(BASE, payload);
  return res.data?.data ?? res.data;
};

export const updateUser = async (
  id: number | string,
  payload: Partial<
    Omit<IUser, "id" | "created_at" | "updated_at"> & {
      password?: string;
      password_confirmation?: string;
    }
  >,
): Promise<IUser> => {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data?.data ?? res.data;
};

export const deleteUser = async (id: number | string): Promise<void> => {
  await api.delete(`${BASE}/${id}`);
};
