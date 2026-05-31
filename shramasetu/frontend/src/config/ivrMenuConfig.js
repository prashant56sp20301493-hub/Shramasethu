export const ivrMenuConfig = {
  labour: [
    { key: 1, labelKey: 'FindJobs', route: '/dashboard/labour', spokenKey: 'ivr_press1ForJobs', keywords: ['job', 'work', 'kaam', '1', 'one', 'ek', 'ondhu', 'onnu'] },
    { key: 2, labelKey: 'attendanceTracking', route: '/labour/attendance', spokenKey: 'ivr_press2ForAttendance', keywords: ['attendance', 'present', '2', 'two', 'do', 'eradu', 'rendu'] },
    { key: 3, labelKey: 'wagesManagement', route: '/labour/wages', spokenKey: 'ivr_press3ForWages', keywords: ['wage', 'money', 'pay', 'salary', 'paisa', '3', 'three', 'teen', 'mooru', 'moonu'] },
    { key: 4, labelKey: 'insuranceOptions', route: '/labour/insurance', spokenKey: 'ivr_press4ForInsurance', keywords: ['insurance', 'health', 'policy', '4', 'four', 'char', 'naaku', 'naalu'] },
    { key: 5, labelKey: 'pfWelfare', route: '/labour/welfare', spokenKey: 'ivr_press5ForWelfare', keywords: ['welfare', 'pf', 'pension', '5', 'five', 'paanch', 'aidu', 'anju'] },
    { key: 6, labelKey: 'contactSupport', route: '/labour/support', spokenKey: 'ivr_press6ForSupport', keywords: ['support', 'help', 'contact', '6', 'six', 'chah', 'aaru'] }
  ],
  owner: [
    { key: 1, labelKey: 'ManageJobs', route: '/dashboard/owner', spokenKey: 'ivr_press1ForJobs', keywords: ['job', 'post', 'manage', '1', 'one', 'ek', 'ondhu'] },
    { key: 2, labelKey: 'attendanceManagement', route: '/owner/attendance', spokenKey: 'ivr_press2ForAttendance', keywords: ['attendance', 'present', '2', 'two', 'do', 'eradu'] },
    { key: 3, labelKey: 'wagesManagement', route: '/owner/wages', spokenKey: 'ivr_press3ForWages', keywords: ['wage', 'money', 'pay', 'salary', '3', 'three', 'teen', 'mooru'] },
    { key: 4, labelKey: 'rentalSystem', route: '/owner/marketplace', spokenKey: 'ivr_press4ForRentals', keywords: ['rent', 'equipment', 'tractor', '4', 'four', 'char', 'naaku'] },
    { key: 5, labelKey: 'insuranceOptions', route: '/owner/insurance', spokenKey: 'ivr_press5ForInsurance', keywords: ['insurance', 'health', 'policy', '5', 'five', 'paanch', 'aidu'] },
    { key: 6, labelKey: 'contactSupport', route: '/owner/support', spokenKey: 'ivr_press6ForSupport', keywords: ['support', 'help', 'contact', '6', 'six', 'chah', 'aaru'] }
  ],
  admin: [
    { key: 1, labelKey: 'System Status', route: '/dashboard/admin', spokenKey: 'ivr_press1ForStatus', keywords: ['status', 'dashboard', '1', 'one', 'ek'] },
    { key: 2, labelKey: 'rentalSystem', route: '/admin/rental-companies', spokenKey: 'ivr_press2ForRentals', keywords: ['rent', 'company', '2', 'two', 'do'] },
    { key: 3, labelKey: 'insuranceProviders', route: '/admin/insurance-providers', spokenKey: 'ivr_press3ForInsurance', keywords: ['insurance', 'provider', '3', 'three', 'teen'] },
    { key: 4, labelKey: 'profitsLedger', route: '/admin/commissions', spokenKey: 'ivr_press4ForProfits', keywords: ['profit', 'commission', 'money', '4', 'four', 'char'] },
    { key: 5, labelKey: 'chatSupportMonitor', route: '/admin/support-chats', spokenKey: 'ivr_press5ForSupport', keywords: ['support', 'chat', 'monitor', '5', 'five', 'paanch'] }
  ]
};
