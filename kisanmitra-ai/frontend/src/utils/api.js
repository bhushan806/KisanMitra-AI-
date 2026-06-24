import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
});

export const getPredict = async (commodity, mandi, horizon) => {
  const { data } = await api.get(`/predict`, { params: { commodity, mandi, horizon } });
  return data;
};

export const getAlerts = async (commodity = '', level = '') => {
  const { data } = await api.get(`/alerts`, { params: { commodity, level } });
  return data;
};

export const getCommodities = async () => {
  const { data } = await api.get(`/commodities`);
  return data;
};

export const getDashboardSummary = async () => {
  const { data } = await api.get(`/dashboard/summary`);
  return data;
};

export const getCropHealth = async (mandi) => {
  const { data } = await api.get(`/crop-health`, { params: { mandi } });
  return data;
};

export const getFarmerAdvisory = async (commodity, mandi) => {
  const { data } = await api.get(`/farmer-advisory`, { params: { commodity, mandi } });
  return data;
};
