import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to set the auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// API functions
export const authAPI = {
  register: async (data: {
    username: string;
    email: string;
    password: string;
    referrerCode?: string;
  }) => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },
};

export const coursesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/api/courses');
    return response.data;
  },
  getById: async (courseId: string) => {
    const response = await apiClient.get(`/api/courses/${courseId}`);
    return response.data;
  },
  purchase: async (courseId: string) => {
    const response = await apiClient.post(`/api/courses/${courseId}/purchase`);
    return response.data;
  },
  purchaseWithCredits: async (courseId: string) => {
    const response = await apiClient.post(`/api/courses/${courseId}/purchase-with-credits`);
    return response.data;
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get('/api/dashboard/stats');
    return response.data;
  },
};

export const userAPI = {
  checkUsername: async (username: string) => {
    const response = await apiClient.post('/api/user/check-username', { username });
    return response.data;
  },
  updateUsername: async (username: string) => {
    const response = await apiClient.put('/api/user/username', { username });
    return response.data;
  },
  updatePassword: async (currentPassword: string, newPassword: string) => {
    const response = await apiClient.put('/api/user/password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  getProfile: async () => {
    const response = await apiClient.get('/api/user/profile');
    return response.data;
  },
  getPurchasedCourses: async () => {
    const response = await apiClient.get('/api/user/purchased-courses');
    return response.data;
  },
};
