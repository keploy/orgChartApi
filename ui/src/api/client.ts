import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers = config.headers || {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export interface PaginationQuery { offset?: number; limit?: number; sort_field?: string; sort_order?: 'asc' | 'desc'; }

export interface Department { id: number; name: string; }
export interface Job { id: number; title: string; }
// Base person fields returned by create/update endpoints (direct row JSON)
export interface Person { id: number; first_name: string; last_name: string; job_id: number; department_id: number; manager_id?: number; hire_date: string; }
// PersonDetails shape returned by /persons list & getOne endpoints (nested objects only, no *_id primitives)
export interface PersonDetails {
  id: number;
  first_name: string;
  last_name: string;
  hire_date: string; // ISO date string
  job?: { id: number; title: string };
  department?: { id: number; name: string };
  manager?: { id: number; full_name: string };
  // Normalized convenience fields we add client-side for uniform CRUD handling
  job_id?: number;
  department_id?: number;
  manager_id?: number;
  manager_name?: string;
}

export interface UserAuth { username: string; password: string; }
export interface AuthResponse { username: string; token: string; }

// Auth
export const register = (data: UserAuth) => api.post<AuthResponse>('/auth/register', data).then(r => r.data);
export const login = (data: UserAuth) => api.post<AuthResponse>('/auth/login', data).then(r => r.data);
export const deregister = (username: string) => api.post('/auth/deregister', { username }).then(r => r.data);

// Departments
export const listDepartments = (q: PaginationQuery = {}) => api.get<Department[]>('/departments', { params: q }).then(r => r.data);
export const getDepartment = (id: number) => api.get<Department>(`/departments/${id}`).then(r => r.data);
export const createDepartment = (data: Partial<Department>) => api.post<Department>('/departments', data).then(r => r.data);
export const updateDepartment = (id: number, data: Partial<Department>) => api.put(`/departments/${id}`, data).then(r => r.data);
export const deleteDepartment = (id: number) => api.delete(`/departments/${id}`).then(r => r.data);
export const getDepartmentPersons = (id: number) => api.get<Person[]>(`/departments/${id}/persons`).then(r => r.data);

// Jobs
export const listJobs = (q: PaginationQuery = {}) => api.get<Job[]>('/jobs', { params: q }).then(r => r.data);
export const getJob = (id: number) => api.get<Job>(`/jobs/${id}`).then(r => r.data);
export const createJob = (data: Partial<Job>) => api.post<Job>('/jobs', data).then(r => r.data);
export const updateJob = (id: number, data: Partial<Job>) => api.put(`/jobs/${id}`, data).then(r => r.data);
export const deleteJob = (id: number) => api.delete(`/jobs/${id}`).then(r => r.data);
export const getJobPersons = (id: number) => api.get<Person[]>(`/jobs/${id}/persons`).then(r => r.data);

// Persons
export const listPersons = (q: PaginationQuery = {}) => api.get<PersonDetails[]>('/persons', { params: q }).then(r => {
  return r.data.map((p: any) => {
    const job_id = p.job?.id;
    const department_id = p.department?.id;
    const manager_id = p.manager?.id;
    const manager_name = p.manager?.full_name || '';
    return { ...p, job_id, department_id, manager_id, manager_name } as PersonDetails;
  });
});
export const getPerson = (id: number) => api.get<PersonDetails>(`/persons/${id}`).then(r => {
  const p: any = r.data;
  return {
    ...p,
    job_id: p.job?.id,
    department_id: p.department?.id,
    manager_id: p.manager?.id,
    manager_name: p.manager?.full_name || ''
  } as PersonDetails;
});
export const createPerson = (data: Partial<Person>) => api.post<Person>('/persons', data).then(r => r.data);
export const updatePerson = (id: number, data: Partial<Person>) => api.put(`/persons/${id}`, data).then(r => r.data);
export const deletePerson = (id: number) => api.delete(`/persons/${id}`).then(r => r.data);
// Fetch direct reports and normalize to include job/department/manager names for dialog
export const getDirectReports = async (id: number) => {
  const reports: any[] = await api.get(`/persons/${id}/reports`).then(r => r.data);
  // For each report, fetch details to get nested job/department/manager
  return Promise.all(reports.map(async (p) => {
    try {
      const details = await getPerson(p.id);
      return details;
    } catch {
      // fallback to flat row if details endpoint fails
      return { ...p, job: { id: p.job_id, title: '' }, department: { id: p.department_id, name: '' }, manager: { id: p.manager_id, full_name: '' } };
    }
  }));
};
