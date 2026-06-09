import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  AuthProvider,
  useAuth,
} from './AuthContext';

import Login from './pages/Login';

import Register from './pages/Register';

import Dashboard from './pages/Dashboard';

import Profile from './pages/Profile';



// ==========================
// PRIVATE ROUTE
// ==========================

const Private = ({ children }) => {

  const { user, loading } =
    useAuth();

  if (loading) {

    return (

      <div className="page-loading">

        <div className="spinner" />

      </div>
    );
  }

  if (!user) {

    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
};



// ==========================
// PUBLIC ROUTE
// ==========================

const Public = ({ children }) => {

  const { user, loading } =
    useAuth();

  if (loading) {

    return (

      <div className="page-loading">

        <div className="spinner" />

      </div>
    );
  }

  return !user
    ? children
    : (
      <Navigate
        to="/dashboard"
        replace
      />
    );
};



// ==========================
// APP
// ==========================

export default function App() {

  return (

    <AuthProvider>

      <BrowserRouter>

        <Routes>

          {/* ROOT */}

          <Route
            path="/"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />


          {/* PUBLIC ROUTES */}

          <Route
            path="/login"
            element={
              <Public>

                <Login />

              </Public>
            }
          />

          <Route
            path="/register"
            element={
              <Public>

                <Register />

              </Public>
            }
          />


          {/* PRIVATE ROUTES */}

          <Route
            path="/dashboard"
            element={
              <Private>

                <Dashboard />

              </Private>
            }
          />

          <Route
            path="/profile"
            element={
              <Private>

                <Profile />

              </Private>
            }
          />


          {/* FALLBACK */}

          <Route
            path="*"
            element={
              <Navigate
                to="/dashboard"
                replace
              />
            }
          />

        </Routes>

      </BrowserRouter>

    </AuthProvider>
  );
}