import axios from 'axios';

const API_URL = 'http://localhost:5000/api/accounts';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const api = {
  addAccount: async (userId: string, data: any) => axiosInstance.post(`/addAccount/${userId}`, data),
  updateAccount: async (id: string, data: any) => axiosInstance.put(`/updateAccount/${id}`, data),
  deleteAccount: async (id: string) => axiosInstance.delete(`/deleteAccount/${id}`),
  getAccounts: async (userId: string) => axiosInstance.get(`/getAccount/${userId}`),
  searchAccounts: async (query: string) => axiosInstance.get('/search', { params: { query } }),
  getSortedAccounts: async (sortType: string) => axiosInstance.get(`/sortingAccount/${sortType}`),
};

export default api;