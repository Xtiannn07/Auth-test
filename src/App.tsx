// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Contexts/AuthContexts';
import Navbar from './Components/Navigation';
import routes from './routes';

function App() {
  return (
    <Router>
      <AuthProvider>
          <div className="min-h-screen body">
            {/* <Navbar /> */}
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
    </Router>
  );
}

export default App;
