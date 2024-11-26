import axios from 'axios';

const API_URL = 'https://backend-tugas-akhir-paw-kelompok-13.vercel.app/api/records';

const axiosInstance = axios.create({
  baseURL: API_URL,
});

interface RecordData {
  accountId: string;
  type: string;
  amount: number;
  category: string;
  note?: string;
  dateTime: string;
  location?: string;
  toAccountId?: string;
}

export const apiRecord = {
  getRecordByAccount: async (accountId: string) => axiosInstance.get(`/getRecord/${accountId}`),
  getRecordByUser: async (userId: string) => axiosInstance.get(`/getRecordByUser/${userId}`),
  getRecords: async (userId: string) => axiosInstance.get(`/getRecordByUser/${userId}`),
  addRecord: async (data: RecordData) => axiosInstance.post(`/addRecord`, data),
  updateRecord: async (id: string, data: Record<string, unknown>) => axiosInstance.put(`/updateRecord/${id}`, data),
  deleteRecord: async (id: string) => axiosInstance.delete(`/deleteRecord/${id}`),
  addTransfer: async (data: RecordData) => axiosInstance.post(`/addTransfer`, data)
};

export default apiRecord;