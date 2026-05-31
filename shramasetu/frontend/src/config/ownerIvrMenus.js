import { OWNER_INTENTS } from './ownerIvrIntentMap';

export const ownerIvrMenu = [
  { key: 1, labelKey: 'hireLabour', route: '/dashboard/owner', spokenKey: 'ivr_press1ForHire', intent: OWNER_INTENTS.HIRE_LABOUR, icon: 'Users' },
  { key: 2, labelKey: 'ManageJobs', route: '/dashboard/owner', spokenKey: 'ivr_press2ForManage', intent: OWNER_INTENTS.MANAGE_JOBS, icon: 'Sliders' },
  { key: 3, labelKey: 'rentalSystem', route: '/owner/marketplace', spokenKey: 'ivr_press3ForRentals', intent: OWNER_INTENTS.RENTALS, icon: 'Activity' },
  { key: 4, labelKey: 'attendanceTracking', route: '/owner/attendance', spokenKey: 'ivr_press4ForAttendance', intent: OWNER_INTENTS.ATTENDANCE, icon: 'Calendar' },
  { key: 5, labelKey: 'wagesManagement', route: '/owner/wages', spokenKey: 'ivr_press5ForWages', intent: OWNER_INTENTS.WAGES, icon: 'DollarSign' },
  { key: 6, labelKey: 'healthInsuranceSystem', route: '/owner/insurance', spokenKey: 'ivr_press6ForInsurance', intent: OWNER_INTENTS.INSURANCE, icon: 'Shield' },
  { key: 7, labelKey: 'feedbackRating', route: '/owner/feedback', spokenKey: 'ivr_press7ForFeedback', intent: OWNER_INTENTS.FEEDBACK, icon: 'Star' },
  { key: 8, labelKey: 'chatSupportMonitor', route: '/owner/support', spokenKey: 'ivr_press8ForSupport', intent: OWNER_INTENTS.SUPPORT, icon: 'MessageCircle' }
];
