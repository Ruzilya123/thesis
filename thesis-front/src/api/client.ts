import type {
  Category,
  DeliveryMethod,
  FilterOption,
  LoyaltyAccount,
  Order,
  OrderCalculation,
  Product,
  UserProfile,
} from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

type RequestOptions = RequestInit & { auth?: boolean }

function getToken(): string | null {
  return localStorage.getItem('access_token')
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (options.auth !== false) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const response = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.detail || data.code || 'Ошибка запроса')
  }
  if (response.status === 204) return undefined as T
  return response.json()
}

export const api = {
  login: (username: string, password: string) =>
    request<{ access: string; refresh: string }>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
      auth: false,
    }),

  register: (data: Record<string, unknown>) =>
    request('/auth/register/', { method: 'POST', body: JSON.stringify(data), auth: false }),

  getProfile: () => request<UserProfile>('/profile/'),

  getCategories: () => request<Category[]>('/categories/'),

  getRoasts: () => request<FilterOption[]>('/roasts/'),

  getGrinds: () => request<FilterOption[]>('/grinds/'),

  getProducts: (params: Record<string, string>) => {
    const query = new URLSearchParams(params).toString()
    return request<{ results: Product[] }>(`/products/?${query}`)
  },

  getProduct: (id: number) => request<Product>(`/products/${id}/`),

  getDeliveryMethods: () => request<DeliveryMethod[]>('/delivery-methods/'),

  validatePromo: (code: string, items: { price: string; quantity: number }[], delivery_cost: string) =>
    request<{ discount: string }>('/promo/validate/', {
      method: 'POST',
      body: JSON.stringify({ code, items, delivery_cost }),
      auth: false,
    }),

  calculateOrder: (data: Record<string, unknown>) =>
    request<OrderCalculation>('/orders/calculate/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  createOrder: (data: Record<string, unknown>) =>
    request<Order>('/orders/', { method: 'POST', body: JSON.stringify(data) }),

  payOrder: (id: number) =>
    request<{ order: Order }>(`/orders/${id}/pay/`, { method: 'POST' }),

  getOrders: () => request<{ results: Order[] }>('/orders/'),

  getOrder: (id: number) => request<Order>(`/orders/${id}/`),

  getLoyalty: () => request<LoyaltyAccount>('/loyalty/'),

  getAdminOrders: () => request<{ results: Order[] }>('/admin/orders/'),

  updateOrderStatus: (id: number, status: string) =>
    request(`/admin/orders/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  getAdminStats: () =>
    request<{ orders_count: number; total_revenue: string; products_count: number }>(
      '/admin/orders/stats/',
    ),
}
