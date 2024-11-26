import axios from 'axios';

const API_URL = 'http://localhost:5000/api/records';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

export const apiRecord = {
  getRecordByAccount: async (accountId: string) => axiosInstance.get(`/getRecord/${accountId}`),
  getRecordByUser: async (userId: string) => axiosInstance.get(`/getRecordByUser/${userId}`),
  getRecords: async (userId: string) => axiosInstance.get(`/getRecordByUser/${userId}`),
  addRecord: async (data: Record<string, unknown>) => axiosInstance.post(`/addRecord`, data),
  updateRecord: async (id: string, data: Record<string, unknown>) => axiosInstance.put(`/updateRecord/${id}`, data),
  deleteRecord: async (id: string) => axiosInstance.delete(`/deleteRecord/${id}`),

    };

export default apiRecord;