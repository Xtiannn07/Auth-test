import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContexts';
import routes from './routes';

function AppContent() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const logoutTime = localStorage.getItem('logoutTimestamp');
      if (logoutTime && parseInt(logoutTime) > Date.now() - 10000) {
        navigate('/signin', { replace: true });
        window.location.reload();
      }
    };

    window.addEventListener('popstate', checkAuth);
    return () => window.removeEventListener('popstate', checkAuth);
  }, [navigate]);

  return (
    <AuthProvider>
      <div className="min-h-screen body">
        <Routes>
          {routes.map((route, index) => (
            <Route
              key={index}
              path={route.path}
              element={route.element}
            />
          ))}
        </Routes>
      </div>
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;