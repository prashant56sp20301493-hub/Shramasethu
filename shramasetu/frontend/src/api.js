// Central API service — talks to our Express backend at port 5000
const BASE_URL = 'http://localhost:5000/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  register: (userData) => request('POST', '/auth/register', userData),
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  getUser: (uid) => request('GET', `/user/${uid}`),

  // Jobs
  getJobs: () => request('GET', '/jobs'),
  getOwnerJobs: (ownerId) => request('GET', `/jobs/owner/${ownerId}`),
  postJob: (jobData) => request('POST', '/jobs', jobData),
  acceptJob: (jobId, uid) => request('PATCH', `/jobs/${jobId}/accept`, { uid }),

  // Rentals
  getRentals: () => request('GET', '/rentals'),
  addRental: (rentalData) => request('POST', '/rentals', rentalData),

  // Admin
  getAdminUsers: () => request('GET', '/admin/users'),
  deleteUser: (uid) => request('DELETE', `/admin/users/${uid}`),
  getStats: () => request('GET', '/admin/stats'),

  // Attendance
  markAttendance: (data) => request('POST', '/attendance', data),
  getAttendance: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/attendance?${query}`);
  },

  // Wages
  addWage: (data) => request('POST', '/wages', data),
  getWages: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/wages?${query}`);
  },
  updateWageStatus: (id, status) => request('PATCH', `/wages/${id}/status`, { paymentStatus: status }),

  // Equipment Rental Marketplace & Commission
  addRentalCompany: (data) => request('POST', '/rental-companies', data),
  getRentalCompanies: () => request('GET', '/rental-companies'),
  updateRentalCompany: (id, data) => request('PUT', `/rental-companies/${id}`, data),
  updateRentalCompanyStatus: (id, statusData) => request('PATCH', `/rental-companies/${id}/status`, statusData),

  addEquipment: (data) => request('POST', '/equipment-marketplace', data),
  getEquipment: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/equipment-marketplace?${query}`);
  },
  updateEquipment: (id, data) => request('PUT', `/equipment-marketplace/${id}`, data),
  updateEquipmentStatus: (id, statusData) => request('PATCH', `/equipment-marketplace/${id}/status`, statusData),

  createRentalRequest: (data) => request('POST', '/rental-requests', data),
  getRentalRequests: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/rental-requests?${query}`);
  },
  updateRentalRequestStatus: (id, statusData) => request('PATCH', `/rental-requests/${id}/status`, statusData),

  getCommissionStats: () => request('GET', '/admin/commissions/stats'),

  // Health Insurance Helpers
  addInsuranceProvider: (data) => request('POST', '/insurance-providers', data),
  getInsuranceProviders: () => request('GET', '/insurance-providers'),
  updateInsuranceProvider: (id, data) => request('PUT', `/insurance-providers/${id}`, data),
  updateInsuranceProviderStatus: (id, statusData) => request('PATCH', `/insurance-providers/${id}/status`, statusData),

  addInsurancePlan: (data) => request('POST', '/insurance-plans', data),
  getInsurancePlans: () => request('GET', '/insurance-plans'),
  updateInsurancePlan: (id, data) => request('PUT', `/insurance-plans/${id}`, data),
  updateInsurancePlanStatus: (id, statusData) => request('PATCH', `/insurance-plans/${id}/status`, statusData),

  createInsuranceApplication: (data) => request('POST', '/insurance-applications', data),
  getInsuranceApplications: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/insurance-applications?${query}`);
  },
  updateInsuranceApplicationStatus: (id, statusData) => request('PATCH', `/insurance-applications/${id}/status`, statusData),
  
  getActiveInsurancePolicies: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/active-insurance-policies?${query}`);
  },

  getUnifiedProfitStats: () => request('GET', '/admin/profits/stats'),

  // Feedback
  submitFeedback: (data) => request('POST', '/feedback', data),
  getFeedback: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/feedback?${query}`);
  },
  replyToFeedback: (id, data) => request('PATCH', `/feedback/${id}/reply`, data),
  getFeedbackStats: () => request('GET', '/admin/feedback/stats'),

  // AI Chat Support
  sendAIChatMessage: (data) => request('POST', '/ai-chat/message', data),
  getAIChatHistory: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/ai-chat/history?${query}`);
  },
  clearAIChatHistory: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('DELETE', `/ai-chat/history?${query}`);
  },

  // Support Escalations
  submitSupportEscalation: (data) => request('POST', '/support-escalations', data),
  getSupportEscalations: (params) => {
    const query = new URLSearchParams(params).toString();
    return request('GET', `/support-escalations?${query}`);
  },
  replyToSupportEscalation: (id, data) => request('PATCH', `/support-escalations/${id}/reply`, data),

  // Health
  health: () => request('GET', '/health'),
};
