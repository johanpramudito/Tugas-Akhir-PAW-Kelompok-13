import axios from 'axios';

const API_URL = 'https://backend-tugas-akhir-paw-kelompok-13.vercel.app/api/records';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const apiRecord = {
  getRecordByAccount: async (accountId: string) => axiosInstance.get(`/getRecord/${accountId}`),
  getRecordByUser: async (userId: string) => axiosInstance.get(`/getRecordByUser/${userId}`),
  addRecord: async (accountId: string, data: Record<string, unknown>) => axiosInstance.post(`/addRecord/${accountId}`, data),
  updateRecord: async (id: string, data: Record<string, unknown>) => axiosInstance.put(`/updateRecord/${id}`, data),
  deleteRecord: async (id: string) => axiosInstance.delete(`/deleteRecord/${id}`),
};

export default apiRecord;