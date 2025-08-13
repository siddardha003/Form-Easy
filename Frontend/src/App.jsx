import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import Signin from './pages/Auth/Signin';
import Signup from './pages/Auth/Signup';
import Dashboard from './pages/Dashboard/Dashboard';
import FormBuilder from './pages/Dashboard/FormBuilder';
import FormPreview from './pages/Dashboard/FormPreview';
import Reports from './pages/Dashboard/Reports';
import PublicForm from './pages/PublicForm';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/form/:id" element={<PublicForm />} />
            
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route 
              path="/auth/signin" 
              element={
                <PublicRoute>
                  <Signin />
                </PublicRoute>
              } 
            />
            <Route 
              path="/auth/signup" 
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              } 
            />

            {/* Protected routes - require authentication */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forms/builder/:id?" 
              element={
                <ProtectedRoute>
                  <FormBuilder />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/forms/preview/:id" 
              element={
                <ProtectedRoute>
                  <FormPreview />
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

            {/* Catch all route - redirect to home */}
            <Route path="*" element={<HomePage />} />
          </Routes>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;