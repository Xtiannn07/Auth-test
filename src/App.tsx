import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContext';
import { LoadingProvider } from './Contexts/LoadingContext';
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
      <LoadingProvider> 
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
      </LoadingProvider>
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