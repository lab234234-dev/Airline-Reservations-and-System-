// SkyHigh Air API Service for React Client

const API_BASE = '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

async function handleResponse(res) {
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = { message: 'Unexpected server response' };
  }

  if (!res.ok) {
    const error = new Error(data.message || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  // Auth
  async register(userData) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData)
    });
    return handleResponse(res);
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(credentials)
    });
    return handleResponse(res);
  },

  async logout() {
    const res = await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(profileData)
    });
    return handleResponse(res);
  },

  async uploadAvatar(fileOrBase64) {
    if (typeof fileOrBase64 === 'string') {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ image: fileOrBase64 })
      });
      return handleResponse(res);
    } else {
      const formData = new FormData();
      formData.append('avatar', fileOrBase64);
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        credentials: 'include',
        body: formData
      });
      return handleResponse(res);
    }
  },

  // Flights
  async getFlights(params = {}) {
    const query = new URLSearchParams();
    if (params.origin) query.append('origin', params.origin);
    if (params.destination) query.append('destination', params.destination);
    if (params.date) query.append('date', params.date);

    const url = `${API_BASE}/flights${query.toString() ? '?' + query.toString() : ''}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getFlightById(id) {
    const res = await fetch(`${API_BASE}/flights/${id}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async addFlight(flightData) {
    const res = await fetch(`${API_BASE}/flights`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(flightData)
    });
    return handleResponse(res);
  },

  async updateFlight(id, flightData) {
    const res = await fetch(`${API_BASE}/flights/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(flightData)
    });
    return handleResponse(res);
  },

  async deleteFlight(id) {
    const res = await fetch(`${API_BASE}/flights/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  // Bookings
  async bookTicket(bookingData) {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(bookingData)
    });
    return handleResponse(res);
  },

  async getMyBookings() {
    const res = await fetch(`${API_BASE}/bookings/my-bookings`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getAllBookings() {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async getBooking(id) {
    const res = await fetch(`${API_BASE}/bookings/${id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async cancelBooking(id) {
    const res = await fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async completeCheckIn(bookingId) {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/checkin`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async completeCheckInByPnr(pnr) {
    const res = await fetch(`${API_BASE}/bookings/checkin-pnr`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({ pnr })
    });
    return handleResponse(res);
  },

  // Airport Counter
  async bookCounterTicket(payload) {
    const res = await fetch(`${API_BASE}/airport/book-counter-ticket`, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify(payload)
    });
    return handleResponse(res);
  },

  async getCounterBookings() {
    const res = await fetch(`${API_BASE}/airport/counter-bookings`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      method: 'GET',
      headers: getAuthHeaders(),
      credentials: 'include'
    });
    return handleResponse(res);
  },

  async checkHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  }
};
