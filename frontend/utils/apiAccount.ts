import axios from 'axios';

// Use environment variable for the API URL
const API_URL = process.env.NEXT_PUBLIC_ACCOUNT_API_URL || '';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const apiAccount = {
  addAccount: async (userId: string, data: { name: string; type: string; initialAmount: number }) =>
    axiosInstance.post(`/addAccount/${userId}`, data),
  updateAccount: async (id: string, data: { name?: string; type?: string; initialAmount?: number }) =>
    axiosInstance.put(`/updateAccount/${id}`, data),
  deleteAccount: async (id: string) => axiosInstance.delete(`/deleteAccount/${id}`),
  getAccounts: async (userId: string) => axiosInstance.get(`/getAccount/${userId}`),
};

export default apiAccount;