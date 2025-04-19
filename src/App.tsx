// src/App.tsx
import { useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import store from './store/store';
import AuthStateListener from './Components/Auth/AuthStateListener';
import routes from './routes';

function AppContent() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const checkAuth = useCallback(() => {
    const logoutTime = localStorage.getItem('logoutTimestamp');
    if (logoutTime && parseInt(logoutTime) > Date.now() - 10000) {
      navigate('/signin', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    checkAuth();
    window.addEventListener('popstate', checkAuth);
    return () => window.removeEventListener('popstate', checkAuth);
  }, [checkAuth]);

  useEffect(() => {
    queryClient.removeQueries({
      predicate: (query) => {
        return !query.queryKey.some(key => 
          String(key).includes('auth') || String(key).includes('settings')
        ) && query.state.fetchStatus !== 'fetching';
      },
      type: 'inactive',
    });
  }, [location.pathname, queryClient]);

  return (
    <AuthStateListener>
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
    </AuthStateListener>
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