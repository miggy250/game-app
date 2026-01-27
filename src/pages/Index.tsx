import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard (handled by App.tsx routing)
  return <Navigate to="/" replace />;
};

export default Index;
