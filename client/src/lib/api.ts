// API client to replace Supabase calls
const API_BASE = '/api';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  success?: boolean;
}

export class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(email: string, password: string) {
    return this.request<ApiResponse<any>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: any) {
    return this.request<ApiResponse<any>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // User methods
  async getUser(id: string) {
    return this.request<any>(`/users/${id}`);
  }

  // Doctor methods
  async getDoctors() {
    return this.request<any[]>('/doctors');
  }

  async getDoctor(userId: string) {
    return this.request<any>(`/doctors/${userId}`);
  }

  async createDoctor(doctorData: any) {
    return this.request<any>('/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData),
    });
  }

  async updateDoctor(userId: string, updates: any) {
    return this.request<any>(`/doctors/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Patient methods
  async getPatients() {
    return this.request<any[]>('/patients');
  }

  async createPatient(patientData: any) {
    return this.request<any>('/patients', {
      method: 'POST',
      body: JSON.stringify(patientData),
    });
  }

  // Appointment methods
  async getAppointments(filters: { patientId?: string; doctorId?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    
    const query = params.toString();
    return this.request<any[]>(`/appointments${query ? `?${query}` : ''}`);
  }

  async createAppointment(appointmentData: any) {
    return this.request<any>('/appointments', {
      method: 'POST',
      body: JSON.stringify(appointmentData),
    });
  }

  async updateAppointment(id: string, updates: any) {
    return this.request<any>(`/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Prescription methods
  async getPrescriptions(filters: { patientId?: string; doctorId?: string } = {}) {
    const params = new URLSearchParams();
    if (filters.patientId) params.append('patientId', filters.patientId);
    if (filters.doctorId) params.append('doctorId', filters.doctorId);
    
    const query = params.toString();
    return this.request<any[]>(`/prescriptions${query ? `?${query}` : ''}`);
  }

  async createPrescription(prescriptionData: any) {
    return this.request<any>('/prescriptions', {
      method: 'POST',
      body: JSON.stringify(prescriptionData),
    });
  }

  async updatePrescription(id: string, updates: any) {
    return this.request<any>(`/prescriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }
}

export const apiClient = new ApiClient();