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
  role: 'ADMIN' | 'STAFF' | 'STUDENT' | 'TEACHER' | 'PARENT' | 'VIEWER';
  isActive: boolean;
  mustChangePassword?: boolean;
  studentId?: string | null;
  teacherId?: string | null;
  parentId?: string | null;
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

export interface AvailableCourse extends Course {
  enrollmentStatus?: 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'DROPPED' | 'CANCELLED' | null;
  enrollmentId?: string | null;
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
  reversalReason?: string | null;
  reversedBy?: string | null;
  reversedAt?: string | null;
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
    reversalReason?: string | null;
    reversedBy?: string | null;
    reversedAt?: string | null;
    transactionReference?: string | null;
    student?: Student;
    enrollment?: Enrollment;
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
  reversalReason?: string | null;
  reversedBy?: string | null;
  reversedAt?: string | null;
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
    regenerateCredentials: (id: string) =>
      apiRequest<{ success: boolean; message: string; studentCredentials: StudentCredentials }>(
        `/students/${id}/regenerate-credentials`,
        { method: 'POST' }
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
    getAvailableCourses: () => apiRequest<AvailableCourse[]>('/student-portal/available-courses'),
    getCourse: (enrollmentId: string) => apiRequest<Enrollment>(`/student-portal/courses/${enrollmentId}`),
    requestEnrollment: (data: { courseId: string; notes?: string }) =>
      apiRequest<{ success: boolean; message: string; enrollment: Enrollment }>(
        '/student-portal/request-enrollment',
        { method: 'POST', body: JSON.stringify(data) }
      ),
    cancelEnrollmentRequest: (enrollmentId: string) =>
      apiRequest<{ success: boolean; message: string }>(
        `/student-portal/enrollments/${enrollmentId}`,
        { method: 'DELETE' }
      ),
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
    getRoutine: () => apiRequest<RoutineResponse>('/student-portal/routine'),
    getGrades: (offeringId?: string) =>
      apiRequest<StudentGradesResponse>(`/student-portal/grades${offeringId ? `?offeringId=${offeringId}` : ''}`),
    getAttendance: (offeringId?: string) =>
      apiRequest<StudentAttendanceReport>(`/student-portal/attendance${offeringId ? `?offeringId=${offeringId}` : ''}`),
    getOfferings: () => apiRequest<CourseOffering[]>('/student-portal/offerings'),
    registerOffering: (offeringId: string) =>
      apiRequest<Enrollment>(`/student-portal/offerings/${offeringId}/register`, { method: 'POST' }),
  },

  academicTerms: {
    list: () => apiRequest<AcademicTerm[]>('/academic-terms'),
    getCurrent: () => apiRequest<AcademicTerm | null>('/academic-terms/current'),
    get: (id: string) => apiRequest<AcademicTerm>(`/academic-terms/${id}`),
    create: (data: Partial<AcademicTerm>) =>
      apiRequest<AcademicTerm>('/academic-terms', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: Partial<AcademicTerm>) =>
      apiRequest<AcademicTerm>(`/academic-terms/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => apiRequest<void>(`/academic-terms/${id}`, { method: 'DELETE' }),
  },

  teachers: {
    list: () => apiRequest<TeacherProfile[]>('/teachers'),
    get: (id: string) => apiRequest<TeacherProfile>(`/teachers/${id}`),
    create: (data: any) =>
      apiRequest<TeacherProfile & { temporaryPassword?: string }>('/teachers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      apiRequest<TeacherProfile>(`/teachers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    resetPassword: (id: string) =>
      apiRequest<any>(`/teachers/${id}/reset-password`, { method: 'POST' }),
  },

  courseOfferings: {
    list: (params?: { termId?: string; courseId?: string; teacherId?: string; status?: string }) => {
      const q = new URLSearchParams();
      if (params?.termId) q.set('termId', params.termId);
      if (params?.courseId) q.set('courseId', params.courseId);
      if (params?.teacherId) q.set('teacherId', params.teacherId);
      if (params?.status) q.set('status', params.status);
      const qs = q.toString();
      return apiRequest<CourseOffering[]>(`/course-offerings${qs ? `?${qs}` : ''}`);
    },
    getAvailable: (termId?: string) =>
      apiRequest<CourseOffering[]>(`/course-offerings/available${termId ? `?termId=${termId}` : ''}`),
    get: (id: string) => apiRequest<CourseOffering>(`/course-offerings/${id}`),
    create: (data: any) =>
      apiRequest<CourseOffering>('/course-offerings', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: any) =>
      apiRequest<CourseOffering>(`/course-offerings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    publish: (id: string) =>
      apiRequest<CourseOffering>(`/course-offerings/${id}/publish`, { method: 'POST' }),
    register: (id: string) =>
      apiRequest<Enrollment>(`/course-offerings/${id}/register`, { method: 'POST' }),
  },

  attendance: {
    getSession: (sessionId: string) => apiRequest<any>(`/attendance/session/${sessionId}`),
    bulkMark: (sessionId: string, records: any[]) =>
      apiRequest<any>(`/attendance/session/${sessionId}`, {
        method: 'POST',
        body: JSON.stringify({ records }),
      }),
    getStudent: (studentId: string, offeringId?: string) =>
      apiRequest<StudentAttendanceReport>(
        `/attendance/student/${studentId}${offeringId ? `?offeringId=${offeringId}` : ''}`
      ),
  },

  gradebook: {
    createAssessment: (data: any) =>
      apiRequest<Assessment>('/gradebook/assessments', { method: 'POST', body: JSON.stringify(data) }),
    getOfferingAssessments: (offeringId: string) =>
      apiRequest<Assessment[]>(`/gradebook/offerings/${offeringId}/assessments`),
    getOfferingGradebook: (offeringId: string) =>
      apiRequest<OfferingGradebook>(`/gradebook/offerings/${offeringId}`),
    recordGrades: (assessmentId: string, data: { grades: any[]; publish?: boolean }) =>
      apiRequest<any>(`/gradebook/assessments/${assessmentId}/grades`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getStudent: (studentId: string, offeringId?: string) =>
      apiRequest<StudentGradesResponse>(
        `/gradebook/student/${studentId}${offeringId ? `?offeringId=${offeringId}` : ''}`
      ),
  },

  teacherPortal: {
    getMe: () => apiRequest<TeacherProfile>('/teacher-portal/me'),
    changePassword: (data: any) =>
      apiRequest<any>('/teacher-portal/change-password', { method: 'POST', body: JSON.stringify(data) }),
    getDashboard: () => apiRequest<any>('/teacher-portal/dashboard'),
    getTimetable: () => apiRequest<{ teacherId: string; routine: RoutineClass[] }>('/teacher-portal/timetable'),
    getCourses: () => apiRequest<CourseOffering[]>('/teacher-portal/courses'),
    getCourse: (id: string) => apiRequest<CourseOffering>(`/teacher-portal/courses/${id}`),
    getCourseRoster: (id: string) =>
      apiRequest<{ offering: CourseOffering; students: any[] }>(`/teacher-portal/courses/${id}/roster`),
    getCourseSessions: (id: string) =>
      apiRequest<ClassSession[]>(`/teacher-portal/courses/${id}/sessions`),
    markSessionAttendance: (sessionId: string, records: any[]) =>
      apiRequest<any>(`/teacher-portal/sessions/${sessionId}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ records }),
      }),
    getCourseGradebook: (id: string) =>
      apiRequest<OfferingGradebook>(`/teacher-portal/courses/${id}/gradebook`),
    createAssessment: (data: any) =>
      apiRequest<Assessment>('/teacher-portal/assessments', { method: 'POST', body: JSON.stringify(data) }),
    recordGrades: (assessmentId: string, data: { grades: any[]; publish?: boolean }) =>
      apiRequest<any>(`/teacher-portal/assessments/${assessmentId}/grades`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  parents: {
    list: () => apiRequest<ParentProfile[]>('/parents'),
    get: (id: string) => apiRequest<ParentProfile>(`/parents/${id}`),
    create: (data: any) =>
      apiRequest<ParentProfile & { temporaryPassword?: string }>('/parents', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    linkStudent: (id: string, data: { studentId: string; isPrimaryGuardian?: boolean }) =>
      apiRequest<any>(`/parents/${id}/link-student`, { method: 'POST', body: JSON.stringify(data) }),
    resetPassword: (id: string) =>
      apiRequest<{
        message: string;
        parentCode: string;
        fullName: string;
        username: string;
        email: string;
        temporaryPassword: string;
        linkedStudents: string[];
      }>(`/parents/${id}/reset-password`, { method: 'POST' }),
  },

  parentPortal: {
    getMe: () => apiRequest<ParentProfile>('/parent-portal/me'),
    changePassword: (data: any) =>
      apiRequest<any>('/parent-portal/change-password', { method: 'POST', body: JSON.stringify(data) }),
    getChildren: () =>
      apiRequest<{ relationshipId: string; isPrimaryGuardian: boolean; student: Student }[]>(
        '/parent-portal/children'
      ),
    getChildDashboard: (studentId: string) =>
      apiRequest<any>(`/parent-portal/children/${studentId}/dashboard`),
    getChildTimetable: (studentId: string) =>
      apiRequest<{ studentId: string; routine: any[] }>(`/parent-portal/children/${studentId}/timetable`),
    getChildAttendance: (studentId: string) =>
      apiRequest<StudentAttendanceReport>(`/parent-portal/children/${studentId}/attendance`),
    getChildGrades: (studentId: string) =>
      apiRequest<StudentGradesResponse>(`/parent-portal/children/${studentId}/grades`),
    getChildPayments: (studentId: string) =>
      apiRequest<Payment[]>(`/parent-portal/children/${studentId}/payments`),
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

  notifications: {
    getAll: (params?: { page?: number; limit?: number; isRead?: string; type?: string }) => {
      const q = new URLSearchParams();
      if (params?.page) q.set('page', String(params.page));
      if (params?.limit) q.set('limit', String(params.limit));
      if (params?.isRead !== undefined) q.set('isRead', params.isRead);
      if (params?.type) q.set('type', params.type);
      const qs = q.toString();
      return apiRequest<NotificationsResponse>(`/notifications${qs ? `?${qs}` : ''}`);
    },
    getUnreadCount: () => apiRequest<{ unreadCount: number }>('/notifications/unread-count'),
    getVapidPublicKey: () => apiRequest<{ publicKey: string }>('/notifications/vapid-public-key'),
    subscribePush: (data: { endpoint: string; keys: { p256dh: string; auth: string }; userAgent?: string }) =>
      apiRequest<{ success: boolean; message: string }>('/notifications/push-subscription', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    unsubscribePush: (endpoint: string) =>
      apiRequest<{ success: boolean; message: string }>('/notifications/push-subscription', {
        method: 'DELETE',
        body: JSON.stringify({ endpoint }),
      }),
    markAsRead: (id: string) =>
      apiRequest<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllAsRead: () =>
      apiRequest<{ success: boolean; message: string }>('/notifications/read-all', { method: 'PATCH' }),
    delete: (id: string) =>
      apiRequest<{ success: boolean; message: string }>(`/notifications/${id}`, { method: 'DELETE' }),
    sendTest: () =>
      apiRequest<NotificationItem>('/notifications/test', { method: 'POST' }),
  },
};

export interface NotificationItem {
  id: string;
  userId: string | null;
  targetRole: string | null;
  title: string;
  message: string;
  type: string;
  link: string | null;
  isRead: boolean;
  readAt: string | null;
  metadata: any;
  createdAt: string;
}

export interface NotificationsResponse {
  data: NotificationItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    unreadCount: number;
  };
}

// -----------------------------------------------------------------------------
// Academic Management System Types
// -----------------------------------------------------------------------------

export interface AcademicTerm {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  isCurrent: boolean;
  offerings?: CourseOffering[];
  createdAt: string;
  updatedAt: string;
}

export interface TeacherProfile {
  id: string;
  teacherId: string;
  userId: string;
  department: string;
  designation: string;
  specialization: string | null;
  phone: string;
  officeLocation: string | null;
  bio: string | null;
  hireDate: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'INACTIVE';
  user?: User;
  offerings?: CourseOffering[];
  createdAt: string;
  updatedAt: string;
}

export interface ParentProfile {
  id: string;
  userId: string;
  phone: string;
  relationship: string;
  occupation: string | null;
  emergencyContact: string | null;
  user?: User;
  studentRelationships?: {
    id: string;
    studentId: string;
    isPrimaryGuardian: boolean;
    isVerified: boolean;
    student: Student;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface OfferingSchedule {
  id: string;
  offeringId: string;
  dayOfWeek: number;
  dayName: string;
  startTime: string;
  endTime: string;
  classroom: string | null;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  termId: string;
  teacherId: string | null;
  section: string;
  code: string;
  classroom: string;
  capacity: number;
  enrolledCount: number;
  status: 'DRAFT' | 'PUBLISHED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  feeOverride: number | null;
  course?: Course;
  term?: AcademicTerm;
  teacher?: TeacherProfile;
  schedules?: OfferingSchedule[];
  enrollments?: Enrollment[];
  classSessions?: ClassSession[];
  assessments?: Assessment[];
  isEnrolled?: boolean;
  isFull?: boolean;
  remainingSeats?: number;
}

export interface ClassSession {
  id: string;
  offeringId: string;
  sessionNumber: number;
  title: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  classroom: string | null;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  topic: string | null;
  offering?: CourseOffering;
  attendanceRecords?: AttendanceRecord[];
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks: string | null;
  markedBy: string | null;
  markedAt: string;
  session?: ClassSession;
  student?: Student;
}

export interface Assessment {
  id: string;
  offeringId: string;
  title: string;
  type: 'QUIZ' | 'ASSIGNMENT' | 'MIDTERM' | 'FINAL' | 'PROJECT' | 'PARTICIPATION' | 'OTHER';
  totalMarks: number;
  weightage: number;
  dueDate: string | null;
  isPublished: boolean;
  grades?: Grade[];
}

export interface Grade {
  id: string;
  assessmentId: string;
  studentId: string;
  obtainedMarks: number;
  feedback: string | null;
  status: 'DRAFT' | 'SUBMITTED' | 'PUBLISHED';
  gradedBy: string | null;
  gradedAt: string | null;
  assessment?: Assessment;
}

export interface RoutineClass {
  sessionId?: string | null;
  sessionNumber?: number | null;
  sessionTitle: string;
  offeringId: string;
  offeringCode: string;
  courseName: string;
  section: string;
  classroom: string;
  teacherName: string;
  startTime: string;
  endTime: string;
  topic?: string | null;
  status: string;
  attendanceStatus?: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;
  dayOfWeek?: number;
  dayName?: string;
}

export interface RoutineDay {
  date: string;
  dayOfWeek: number;
  dayName: string;
  isToday: boolean;
  dayOffset: number;
  classesCount: number;
  classes: RoutineClass[];
}

export interface RoutineResponse {
  studentId: string;
  timezone: string;
  rollingWindow: RoutineDay[];
}

export interface StudentAttendanceReport {
  studentId: string;
  totalSessions: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  excusedCount: number;
  attendancePercentage: number;
  records: {
    id: string;
    sessionId: string;
    courseName: string;
    offeringCode: string;
    sessionNumber: number;
    sessionTitle: string;
    sessionDate: string;
    startTime: string;
    endTime: string;
    classroom: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    remarks: string | null;
    markedAt: string;
  }[];
}

export interface StudentGradesResponse {
  studentId: string;
  courses: {
    offeringId: string;
    offeringCode: string;
    courseName: string;
    totalScore: number;
    letterGrade: string;
    gpa: number;
    assessments: {
      id: string;
      assessmentTitle: string;
      assessmentType: string;
      totalMarks: number;
      obtainedMarks: number;
      weightage: number;
      weightedContribution: number;
      feedback: string | null;
      gradedAt: string | null;
    }[];
  }[];
}

export interface OfferingGradebook {
  offering: CourseOffering;
  assessments: Assessment[];
  students: {
    studentId: string;
    registrationNumber: string;
    fullName: string;
    totalWeightedScore: number;
    letterGrade: string;
    gpa: number;
    marks: {
      assessmentId: string;
      assessmentTitle: string;
      weightage: number;
      totalMarks: number;
      obtainedMarks: number | null;
      status: string;
      feedback: string | null;
    }[];
  }[];
}

