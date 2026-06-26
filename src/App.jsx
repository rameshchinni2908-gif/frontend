import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import {
  lazy,
  Suspense
} from "react";
import { CircularProgress, Box } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

const Login = lazy(() =>
  import("./pages/Login")
);

const ForgotPassword = lazy(() =>
  import('./pages/ForgotPassword')
);

const ResetPassword = lazy(() =>
  import('./pages/ResetPassword')
);

const ChangePassword = lazy(() =>
  import('./pages/ChangePassword')
);

const Dashboard =
  lazy(() =>
    import("./pages/Dashboard")
  );

const Reports =
  lazy(() =>
    import("./pages/Reports")
  );

function ProtectedRoute({ children }) {
  const { isAuthenticated, isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <LoadingFallback />;
  }

  return isAuthenticated ? children : <Navigate to="/" />;
}

function LoadingFallback() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}
    >
      <CircularProgress />
    </Box>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route
                path="/"
                element={<Login />}
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />

              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />

              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;