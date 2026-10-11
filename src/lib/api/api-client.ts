function getApiBase(): string {
  let base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1').trim();
  base = base.replace(/\/+$/, '');
  if (!base.endsWith('/api/v1')) {
    if (base.endsWith('/api')) {
      base = `${base}/v1`;
    } else {
      base = `${base}/api/v1`;
    }
  }
  return base;
}

const API_BASE = getApiBase();

export class ApiError extends Error {
  statusCode: number;
  errorName: string;
  data: any;

  constructor(message: string, statusCode: number, errorName = 'ApiError', data = null) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errorName = errorName;
    this.data = data;
  }
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('fit_access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    if (res.status === 401 && typeof window !== 'undefined') {
      // Clear token on 401 Unauthorized
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('fit_access_token');
        localStorage.removeItem('fit_user');
        window.location.href = '/login?expired=true';
      }
    }

    const contentType = res.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      let errorMessage = 'An unexpected error occurred.';
      if (typeof data === 'object' && data !== null) {
        if (Array.isArray(data.message)) {
          errorMessage = data.message.join(', ');
        } else if (data.message) {
          errorMessage = data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }
      throw new ApiError(errorMessage, res.status, data?.error || 'Error', data);
    }

    return data as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(
      err.message || 'Unable to connect to the backend server. Please verify your connection.',
      0,
      'NetworkError'
    );
  }
}

// -----------------------------------------------------------------------------
// Type Definitions
// -----------------------------------------------------------------------------
export interface User {
  id: string;
  email: string;
  username?: string | null;
  fullName: string;
  role: 'ADMIN' | 'STAFF' | 'STUDENT' | 'VIEWER';
  isActive: boolean;
  mustChangePassword?: boolean;
  studentId?: string | null;
  registrationNumber?: string | null;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  category: string;
  description: string | null;
  duration: string;
  totalFee: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
}

export interface Student {
  id: string;
  registrationNumber: string;
  fullName: string;
  nidOrBirthCertificateNumber: string;
  presentAddress: string;
  mobileNumber: string;
  parentName: string;
  parentMobileNumber: string;
  status: 'ACTIVE' | 'INACTIVE' | 'COMPLETED' | 'DROPPED';
  isArchived: boolean;
  userId?: string | null;
  user?: {
    id: string;
    email: string;
    username?: string | null;
    isActive: boolean;
    mustChangePassword: boolean;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  enrollments?: Enrollment[];
  payments?: Payment[];
  financials?: {
    totalPayable: number;
    totalPaid: number;
    outstandingDue: number;
  };
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  agreedFee: number;
  discount: number;
  finalFee: number;
  status: 'PENDING' | 'ACTIVE' | 'DROP_REQUESTED' | 'DROPPED' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  course?: Course;
  student?: Student;
  payments?: Payment[];
  paidAmount?: number;
  dueAmount?: number;
  hasPendingDropRequest?: boolean;
}

export interface DropRequest {
  id: string;
  enrollmentId: string;
  studentId: string;
  reason: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  requestDate: string;
  adminNotes: string | null;
  reviewedBy: string | null;
  reviewerName: string | null;
  reviewedAt: string | null;
  enrollment?: Enrollment;
  student?: Student;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCredentials {
  studentId: string;
  fullName: string;
  registrationNumber: string;
  username: string;
  email: string;
  temporaryPassword?: string;
  mustChangePassword: boolean;
}

export interface StudentPortalDashboard {
  student: {
    id: string;
    fullName: string;
    registrationNumber: string;
  };
  stats: {
    totalEnrolledCourses: number;
    activeCoursesCount: number;
    completedCoursesCount: number;
    droppedCoursesCount: number;
    pendingDropRequestsCount: number;
  };
  financials: {
    totalPayable: number;
    totalPaid: number;
    outstandingDue: number;
  };
  recentPayments: Payment[];
  activeEnrollments: Enrollment[];
  recentDropRequests: DropRequest[];
}

export type PaymentMethod = 'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK_TRANSFER' | 'OTHER';

export interface Payment {
  id: string;
  receiptNumber: string;
  studentId: string;
  enrollmentId: string | null;
  amount: number;
  amountInWords?: string;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  transactionReference: string | null;
  status: 'COMPLETED' | 'REVERSED' | 'PENDING';
  notes: string | null;
  receivedBy: string | null;
  student?: Student;
  enrollment?: Enrollment;
}

export interface DashboardSummary {
  kpis: {
    totalStudents: number;
    activeStudents: number;
    totalActiveCourses: number;
    totalEnrollments: number;
    totalCollected: number;
    totalPayable: number;
    outstandingDue: number;
  };
  recentRegistrations: Array<{
    id: string;
    registrationNumber: string;
    fullName: string;
    mobileNumber: string;
    courses: string[];
    createdAt: string;
  }>;
  recentPayments: Array<{
    id: string;
    receiptNumber: string;
    studentName: string;
    registrationNumber: string;
    amount: number;
    paymentMethod: string;
    paymentDate: string;
    status: string;
  }>;
  courseDistribution: Array<{ name: string; value: number }>;
  monthlyPayments: Array<{ month: string; amount: number }>;
  statusDistribution: Array<{ status: string; count: number }>;
}

export interface RegistrationDocument {
  institute: {
    name: string;
    tagline: string;
    description: string;
    website: string;
    currency: string;
  };
  student: Student;
  courses: Array<{
    id: string;
    code: string;
    name: string;
    category: string;
    duration: string;
    agreedFee: number;
    discount: number;
    finalFee: number;
    status: string;
  }>;
  financials: {
    totalPayable: number;
    advancePayment: number;
    amountInWords: string;
    dueAmount: number;
    totalPaid: number;
  };
  registrationDate: string;
  payments: Payment[];
}

export interface PaymentReceipt {
  receiptNumber: string;
  paymentDate: string;
  paymentMethod: string;
  transactionReference: string | null;
  amount: number;
  amountInWords: string;
  status: string;
  notes: string | null;
  receivedBy: string;
  student: {
    id: string;
    registrationNumber: string;
    fullName: string;
    mobileNumber: string;
    presentAddress: string;
  };
  course?: {
    name: string;
    code: string;
    duration: string;
  } | null;
  financialSummary: {
    totalPayable: number;
    totalPaid: number;
    outstandingDue: number;
  };
  institute: {
    name: string;
    tagline: string;
    description: string;
    website: string;
    currency: string;
  };
}

// -----------------------------------------------------------------------------
// Centralized API Client Service
// -----------------------------------------------------------------------------
export const api = {
  auth: {
    login: (credentials: { email: string; password: string }) =>
      apiRequest<{ accessToken: string; user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => apiRequest<User>('/auth/me'),
    logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  },

  dashboard: {
    getSummary: () => apiRequest<DashboardSummary>('/dashboard/summary'),
  },

  students: {
    getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.status) q.append('status', params.status);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      return apiRequest<{ data: Student[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/students?${q.toString()}`
      );
    },
    getOne: (id: string) => apiRequest<Student>(`/students/${id}`),
    create: (data: any) => apiRequest<Student>('/students', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest<Student>(`/students/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    archive: (id: string) => apiRequest(`/students/${id}`, { method: 'DELETE' }),
    provisionAccount: (id: string, email?: string) =>
      apiRequest<{ success: boolean; message: string; studentCredentials: StudentCredentials }>(
        `/students/${id}/provision-account`,
        { method: 'POST', body: JSON.stringify({ email }) }
      ),
  },

  courses: {
    getAll: (status?: string) => {
      const q = status ? `?status=${status}` : '';
      return apiRequest<Course[]>(`/courses${q}`);
    },
    getOne: (id: string) => apiRequest<Course>(`/courses/${id}`),
    create: (data: Partial<Course>) => apiRequest<Course>('/courses', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<Course>) =>
      apiRequest<Course>(`/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    archive: (id: string) => apiRequest(`/courses/${id}`, { method: 'DELETE' }),
  },

  enrollments: {
    getAll: (params?: { studentId?: string; courseId?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.studentId) q.append('studentId', params.studentId);
      if (params?.courseId) q.append('courseId', params.courseId);
      if (params?.status) q.append('status', params.status);
      return apiRequest<Enrollment[]>(`/enrollments?${q.toString()}`);
    },
    getOne: (id: string) => apiRequest<Enrollment>(`/enrollments/${id}`),
    create: (data: any) => apiRequest<Enrollment>('/enrollments', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) => apiRequest<Enrollment>(`/enrollments/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  },

  payments: {
    getAll: (params?: { studentId?: string; enrollmentId?: string; status?: string; startDate?: string; endDate?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.studentId) q.append('studentId', params.studentId);
      if (params?.enrollmentId) q.append('enrollmentId', params.enrollmentId);
      if (params?.status) q.append('status', params.status);
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      return apiRequest<{ data: Payment[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(
        `/payments?${q.toString()}`
      );
    },
    getOne: (id: string) => apiRequest<Payment>(`/payments/${id}`),
    getReceipt: (id: string) => apiRequest<PaymentReceipt>(`/payments/${id}/receipt`),
    create: (data: any) => apiRequest<Payment>('/payments', { method: 'POST', body: JSON.stringify(data) }),
    reverse: (id: string, data: { reversalReason: string }) =>
      apiRequest<Payment>(`/payments/${id}/reverse`, { method: 'POST', body: JSON.stringify(data) }),
  },

  registrations: {
    register: (data: any) =>
      apiRequest<{
        success: boolean;
        message: string;
        registrationNumber: string;
        student: Student;
        enrollments: Enrollment[];
        payment: Payment | null;
        financials: {
          totalPayable: number;
          advancePaid: number;
          outstandingDue: number;
          advancePaidInWords: string;
          dueInWords: string;
        };
        studentCredentials?: StudentCredentials;
      }>('/registrations', { method: 'POST', body: JSON.stringify(data) }),
    getDocument: (id: string) => apiRequest<RegistrationDocument>(`/registrations/${id}`),
  },

  reports: {
    getEnrollments: (params?: { startDate?: string; endDate?: string; courseId?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.courseId) q.append('courseId', params.courseId);
      if (params?.status) q.append('status', params.status);
      return apiRequest<{ summary: any; items: Enrollment[] }>(`/reports/enrollments?${q.toString()}`);
    },
    getPayments: (params?: { startDate?: string; endDate?: string; method?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.startDate) q.append('startDate', params.startDate);
      if (params?.endDate) q.append('endDate', params.endDate);
      if (params?.method) q.append('method', params.method);
      if (params?.status) q.append('status', params.status);
      return apiRequest<{ summary: any; items: Payment[] }>(`/reports/payments?${q.toString()}`);
    },
    getDues: () => apiRequest<{ summary: any; items: any[] }>('/reports/dues'),
  },

  staff: {
    getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.status) q.append('status', params.status);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      return apiRequest<{
        data: User[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/staff?${q.toString()}`);
    },
    getOne: (id: string) => apiRequest<User>(`/staff/${id}`),
    create: (data: { email: string; password: string; fullName: string; isActive?: boolean }) =>
      apiRequest<User>('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { fullName?: string; password?: string }) =>
      apiRequest<User>(`/staff/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateStatus: (id: string, isActive: boolean) =>
      apiRequest<User>(`/staff/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      }),
  },

  dropRequests: {
    getAll: (params?: { search?: string; status?: string; page?: number; limit?: number }) => {
      const q = new URLSearchParams();
      if (params?.search) q.append('search', params.search);
      if (params?.status) q.append('status', params.status);
      if (params?.page) q.append('page', String(params.page));
      if (params?.limit) q.append('limit', String(params.limit));
      return apiRequest<{
        data: DropRequest[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>(`/drop-requests?${q.toString()}`);
    },
    getOne: (id: string) => apiRequest<DropRequest>(`/drop-requests/${id}`),
    approve: (id: string, data?: { adminNotes?: string }) =>
      apiRequest<{ success: boolean; message: string; dropRequest: DropRequest }>(
        `/drop-requests/${id}/approve`,
        { method: 'PATCH', body: JSON.stringify(data || {}) }
      ),
    reject: (id: string, data?: { adminNotes?: string }) =>
      apiRequest<{ success: boolean; message: string; dropRequest: DropRequest }>(
        `/drop-requests/${id}/reject`,
        { method: 'PATCH', body: JSON.stringify(data || {}) }
      ),
  },

  studentPortal: {
    getMe: () => apiRequest<Student>('/student-portal/me'),
    getDashboard: () => apiRequest<StudentPortalDashboard>('/student-portal/dashboard'),
    getCourses: () => apiRequest<Enrollment[]>('/student-portal/courses'),
    getCourse: (enrollmentId: string) => apiRequest<Enrollment>(`/student-portal/courses/${enrollmentId}`),
    getPayments: () => apiRequest<Payment[]>('/student-portal/payments'),
    getPayment: (paymentId: string) => apiRequest<Payment>(`/student-portal/payments/${paymentId}`),
    getDropRequests: () => apiRequest<DropRequest[]>('/student-portal/drop-requests'),
    createDropRequest: (data: { enrollmentId: string; reason: string }) =>
      apiRequest<{ success: boolean; message: string; dropRequest: DropRequest }>(
        '/student-portal/drop-requests',
        { method: 'POST', body: JSON.stringify(data) }
      ),
    cancelDropRequest: (id: string) =>
      apiRequest<{ success: boolean; message: string }>(`/student-portal/drop-requests/${id}`, {
        method: 'DELETE',
      }),
    updateProfile: (data: { presentAddress?: string; parentName?: string; parentMobileNumber?: string }) =>
      apiRequest<{ success: boolean; message: string; student: Partial<Student> }>(
        '/student-portal/profile',
        { method: 'PATCH', body: JSON.stringify(data) }
      ),
    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      apiRequest<{ success: boolean; message: string }>('/student-portal/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  account: {
    getMe: () => apiRequest<User>('/account/me'),
    updateProfile: (data: { fullName: string }) =>
      apiRequest<User>('/account/profile', { method: 'PATCH', body: JSON.stringify(data) }),
    changePassword: (data: { currentPassword: string; newPassword: string; confirmPassword: string }) =>
      apiRequest<{ success: boolean; message: string }>('/account/change-password', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
};
