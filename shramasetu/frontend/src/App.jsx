import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Register from './pages/auth/Register';
import Login from './pages/auth/Login';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import LabourDashboard from './pages/dashboard/LabourDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import VoiceAssistant from './components/VoiceAssistant';

import LabourAttendance from './pages/attendance/LabourAttendance';
import LabourWages from './pages/wages/LabourWages';
import OwnerAttendance from './pages/attendance/OwnerAttendance';
import OwnerWages from './pages/wages/OwnerWages';
import AdminAttendance from './pages/attendance/AdminAttendance';
import AdminWages from './pages/wages/AdminWages';

import AdminRentalCompanies from './pages/rental/AdminRentalCompanies';
import AdminEquipmentMarketplace from './pages/rental/AdminEquipmentMarketplace';
import AdminRentalRequests from './pages/rental/AdminRentalRequests';
import AdminCommissions from './pages/rental/AdminCommissions';

import OwnerMarketplace from './pages/rental/OwnerMarketplace';
import OwnerRentals from './pages/rental/OwnerRentals';

import AdminInsuranceProviders from './pages/insurance/AdminInsuranceProviders';
import AdminInsurancePlans from './pages/insurance/AdminInsurancePlans';
import AdminInsuranceApplications from './pages/insurance/AdminInsuranceApplications';
import AdminInsurancePolicies from './pages/insurance/AdminInsurancePolicies';
import AdminProfits from './pages/rental/AdminProfits';
import UserInsurance from './pages/insurance/UserInsurance';
import UserInsuranceStatus from './pages/insurance/UserInsuranceStatus';

import UserFeedback from './pages/feedback/UserFeedback';
import AdminFeedback from './pages/feedback/AdminFeedback';
import UserSupport from './pages/support/UserSupport';
import AdminSupport from './pages/support/AdminSupport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register/:role" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route path="/dashboard/owner" element={<OwnerDashboard />} />
        <Route path="/dashboard/labour" element={<LabourDashboard />} />
        <Route path="/dashboard/admin" element={<AdminDashboard />} />

        <Route path="/labour/attendance" element={<LabourAttendance />} />
        <Route path="/labour/wages" element={<LabourWages />} />
        <Route path="/owner/attendance" element={<OwnerAttendance />} />
        <Route path="/owner/wages" element={<OwnerWages />} />
        <Route path="/admin/attendance" element={<AdminAttendance />} />
        <Route path="/admin/wages" element={<AdminWages />} />

        <Route path="/admin/rental-companies" element={<AdminRentalCompanies />} />
        <Route path="/admin/equipment-marketplace" element={<AdminEquipmentMarketplace />} />
        <Route path="/admin/commissions" element={<AdminProfits />} />
        <Route path="/admin/profits" element={<AdminProfits />} />
        <Route path="/admin/rental-requests" element={<AdminRentalRequests />} />

        <Route path="/admin/insurance-providers" element={<AdminInsuranceProviders />} />
        <Route path="/admin/insurance-plans" element={<AdminInsurancePlans />} />
        <Route path="/admin/insurance-applications" element={<AdminInsuranceApplications />} />
        <Route path="/admin/insurance-policies" element={<AdminInsurancePolicies />} />

        <Route path="/owner/marketplace" element={<OwnerMarketplace />} />
        <Route path="/owner/rentals" element={<OwnerRentals />} />

        <Route path="/labour/insurance" element={<UserInsurance />} />
        <Route path="/labour/insurance/status" element={<UserInsuranceStatus />} />
        <Route path="/owner/insurance" element={<UserInsurance />} />
        <Route path="/owner/insurance/status" element={<UserInsuranceStatus />} />

        {/* Feedback & Support Routes */}
        <Route path="/labour/feedback" element={<UserFeedback />} />
        <Route path="/labour/support" element={<UserSupport />} />
        <Route path="/owner/feedback" element={<UserFeedback />} />
        <Route path="/owner/support" element={<UserSupport />} />
        
        <Route path="/admin/feedback" element={<AdminFeedback />} />
        <Route path="/admin/support-chats" element={<AdminSupport />} />
        <Route path="/admin/support-escalations" element={<AdminSupport />} />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <VoiceAssistant />
    </Router>
  );
}

export default App;
