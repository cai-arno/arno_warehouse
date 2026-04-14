import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Home from './pages/Home';
import JuniorSection from './pages/JuniorSection';
import QuestionPractice from './pages/QuestionPractice';
import AnswerAnalysis from './pages/AnswerAnalysis';
import WrongQuestionBook from './pages/WrongQuestionBook';
import Profile from './pages/Profile';
import Achievement from './pages/Achievement';
import Diagnosis from './pages/Diagnosis';
import Membership from './pages/Membership';
import EyeCareReminder from './components/EyeCareReminder';

// 路由守卫
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        加载中...
      </div>
    );
  }
  
  return user ? <Navigate to="/home" /> : children;
}

function AppContent() {
  return (
    <>
      <Routes>
        {/* 公开路由 */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        
        {/* 私有路由 */}
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/junior" element={<PrivateRoute><JuniorSection /></PrivateRoute>} />
        <Route path="/senior" element={<PrivateRoute><JuniorSection /></PrivateRoute>} />
        <Route path="/practice" element={<PrivateRoute><QuestionPractice /></PrivateRoute>} />
        <Route path="/analysis" element={<PrivateRoute><AnswerAnalysis /></PrivateRoute>} />
        <Route path="/wrong" element={<PrivateRoute><WrongQuestionBook /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/achievement" element={<PrivateRoute><Achievement /></PrivateRoute>} />
        <Route path="/diagnosis" element={<PrivateRoute><Diagnosis /></PrivateRoute>} />
        <Route path="/membership" element={<PrivateRoute><Membership /></PrivateRoute>} />
        
        {/* 默认跳转 */}
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
      
      {/* 全局护眼提醒 */}
      <EyeCareReminder enabled={true} intervalMinutes={45} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
