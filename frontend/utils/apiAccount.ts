import axios from 'axios';

const API_URL = 'https://backend-tugas-akhir-paw-kelompok-13.vercel.app/api/accounts';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const api = {
  addAccount: async (userId: string, data: any) => axiosInstance.post(`/addAccount/${userId}`, data),
  updateAccount: async (id: string, data: any) => axiosInstance.put(`/updateAccount/${id}`, data),
  deleteAccount: async (id: string) => axiosInstance.delete(`/deleteAccount/${id}`),
  getAccounts: async (userId: string) => axiosInstance.get(`/getAccount/${userId}`),
};

export default api;