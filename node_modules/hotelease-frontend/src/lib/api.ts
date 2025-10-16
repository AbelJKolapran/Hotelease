import axios from 'axios'

const API_BASE_URL = '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string; fullName: string; hotelName: string }) =>
    api.post('/auth/signup', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
}

// Hotels API
export const hotelsAPI = {
  list: () => api.get('/hotels'),
  create: (data: { name: string; address?: string }) => api.post('/hotels', data),
}

// Tenant API
export const tenantAPI = {
  myHotels: () => api.get('/tenant/my-hotels'),
}

// Rooms API
export const roomsAPI = {
  list: (hotelId: string) => api.get('/rooms', { headers: { 'x-hotel-id': hotelId } }),
  create: (hotelId: string, data: { number: string; type: string; rateCents: number }) =>
    api.post('/rooms', data, { headers: { 'x-hotel-id': hotelId } }),
}

// Customers API
export const customersAPI = {
  list: (hotelId: string) => api.get('/customers', { headers: { 'x-hotel-id': hotelId } }),
  create: (hotelId: string, data: { firstName: string; lastName: string; email?: string; phone?: string }) =>
    api.post('/customers', data, { headers: { 'x-hotel-id': hotelId } }),
}

// Bookings API
export const bookingsAPI = {
  list: (hotelId: string) => api.get('/bookings', { headers: { 'x-hotel-id': hotelId } }),
  create: (hotelId: string, data: {
    roomId: string;
    customerId: string;
    checkInDate: string;
    checkOutDate: string;
    totalCents: number;
  }) => api.post('/bookings', data, { headers: { 'x-hotel-id': hotelId } }),
  checkin: (hotelId: string, bookingId: string) =>
    api.post(`/bookings/${bookingId}/checkin`, {}, { headers: { 'x-hotel-id': hotelId } }),
  checkout: (hotelId: string, bookingId: string) =>
    api.post(`/bookings/${bookingId}/checkout`, {}, { headers: { 'x-hotel-id': hotelId } }),
}

// Payments API
export const paymentsAPI = {
  list: (hotelId: string) => api.get('/payments', { headers: { 'x-hotel-id': hotelId } }),
  create: (hotelId: string, data: { bookingId: string; amountCents: number; currency?: string }) =>
    api.post('/payments', data, { headers: { 'x-hotel-id': hotelId } }),
}

// Reports API
export const reportsAPI = {
  occupancy: (hotelId: string) => api.get('/reports/occupancy', { headers: { 'x-hotel-id': hotelId } }),
  revenue: (hotelId: string) => api.get('/reports/revenue', { headers: { 'x-hotel-id': hotelId } }),
}





