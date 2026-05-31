import { INTENTS } from './ivrIntentMap';

export const ivrMenus = {
  labour: [
    { key: 1, labelKey: 'FindJobs', route: '/dashboard/labour', spokenKey: 'ivr_press1ForJobs', intent: INTENTS.FIND_JOBS, icon: 'Briefcase' },
    { key: 2, labelKey: 'myWorks', route: '/dashboard/labour', spokenKey: 'ivr_press2ForMyWorks', intent: INTENTS.MY_WORKS, icon: 'CheckSquare' },
    { key: 3, labelKey: 'attendanceTracking', route: '/labour/attendance', spokenKey: 'ivr_press3ForAttendance', intent: INTENTS.ATTENDANCE, icon: 'Calendar' },
    { key: 4, labelKey: 'wagesManagement', route: '/labour/wages', spokenKey: 'ivr_press4ForWages', intent: INTENTS.WAGES, icon: 'DollarSign' },
    { key: 5, labelKey: 'healthInsuranceSystem', route: '/labour/insurance', spokenKey: 'ivr_press5ForInsurance', intent: INTENTS.INSURANCE, icon: 'Shield' },
    { key: 6, labelKey: 'feedbackRating', route: '/labour/feedback', spokenKey: 'ivr_press6ForFeedback', intent: INTENTS.FEEDBACK, icon: 'Star' },
    { key: 7, labelKey: 'chatSupportMonitor', route: '/labour/support', spokenKey: 'ivr_press7ForSupport', intent: INTENTS.SUPPORT, icon: 'MessageCircle' }
  ],
  owner: [
    { key: 1, labelKey: 'hireLabour', route: '/dashboard/owner', spokenKey: 'ivr_press1ForHire', intent: INTENTS.FIND_JOBS, icon: 'Users' },
    { key: 2, labelKey: 'ManageJobs', route: '/dashboard/owner', spokenKey: 'ivr_press2ForManage', intent: INTENTS.MY_WORKS, icon: 'Sliders' },
    { key: 3, labelKey: 'rentalSystem', route: '/owner/marketplace', spokenKey: 'ivr_press3ForRentals', intent: INTENTS.RENTALS, icon: 'Activity' },
    { key: 4, labelKey: 'attendanceTracking', route: '/owner/attendance', spokenKey: 'ivr_press4ForAttendance', intent: INTENTS.ATTENDANCE, icon: 'Calendar' },
    { key: 5, labelKey: 'wagesManagement', route: '/owner/wages', spokenKey: 'ivr_press5ForWages', intent: INTENTS.WAGES, icon: 'DollarSign' },
    { key: 6, labelKey: 'healthInsuranceSystem', route: '/owner/insurance', spokenKey: 'ivr_press6ForInsurance', intent: INTENTS.INSURANCE, icon: 'Shield' },
    { key: 7, labelKey: 'feedbackRating', route: '/owner/feedback', spokenKey: 'ivr_press7ForFeedback', intent: INTENTS.FEEDBACK, icon: 'Star' },
    { key: 8, labelKey: 'chatSupportMonitor', route: '/owner/support', spokenKey: 'ivr_press8ForSupport', intent: INTENTS.SUPPORT, icon: 'MessageCircle' }
  ],
  admin: [
    { key: 1, labelKey: 'overview', route: '/dashboard/admin', spokenKey: 'ivr_press1ForOverview', intent: INTENTS.OVERVIEW, icon: 'Layout' },
    { key: 2, labelKey: 'userManagement', route: '/dashboard/admin', spokenKey: 'ivr_press2ForUsers', intent: INTENTS.FIND_JOBS, icon: 'UserCheck' },
    { key: 3, labelKey: 'activeJobs', route: '/dashboard/admin', spokenKey: 'ivr_press3ForJobs', intent: INTENTS.MY_WORKS, icon: 'Briefcase' },
    { key: 4, labelKey: 'rentalSystem', route: '/admin/rental-companies', spokenKey: 'ivr_press4ForRentals', intent: INTENTS.RENTALS, icon: 'Activity' },
    { key: 5, labelKey: 'globalAttendance', route: '/admin/attendance', spokenKey: 'ivr_press5ForAttendance', intent: INTENTS.ATTENDANCE, icon: 'Calendar' },
    { key: 6, labelKey: 'globalWages', route: '/admin/wages', spokenKey: 'ivr_press6ForWages', intent: INTENTS.WAGES, icon: 'DollarSign' },
    { key: 7, labelKey: 'healthInsuranceSystem', route: '/admin/insurance-plans', spokenKey: 'ivr_press7ForInsurance', intent: INTENTS.INSURANCE, icon: 'Shield' },
    { key: 8, labelKey: 'profitsLedger', route: '/admin/commissions', spokenKey: 'ivr_press8ForProfits', intent: INTENTS.WAGES, icon: 'TrendingUp' },
    { key: 9, labelKey: 'manageFeedback', route: '/admin/feedback', spokenKey: 'ivr_press9ForFeedback', intent: INTENTS.FEEDBACK, icon: 'Star' },
    { key: 10, labelKey: 'chatSupportMonitor', route: '/admin/support-chats', spokenKey: 'ivr_press10ForSupport', intent: INTENTS.SUPPORT, icon: 'MessageCircle' }
  ]
};
