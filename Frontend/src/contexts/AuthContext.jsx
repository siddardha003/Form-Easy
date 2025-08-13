import { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

// Auth context
const AuthContext = createContext();

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, user: null, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null,
};

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth data on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { token, user } = authService.getStoredAuthData();
        
        if (token && user) {
          // Just use stored user data for now, don't verify with server
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        // Any error, just set loading to false
        console.log('Auth check error:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    // Add a small delay to prevent flash
    setTimeout(checkAuth, 100);
  }, []);

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.register(userData);
      
      // Store auth data
      authService.storeAuthData(response.data);
      
      // Set user in state
      dispatch({ type: 'SET_USER', payload: response.data.user });
      
      toast.success('Account created successfully!');
      return response;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.login(credentials);
      
      // Store auth data
      authService.storeAuthData(response.data);
      
      // Set user in state
      dispatch({ type: 'SET_USER', payload: response.data.user });
      
      toast.success('Welcome back!');
      return response;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Google login function
  const googleLogin = async (token) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.googleLogin(token);
      
      // Store auth data
      authService.storeAuthData(response.data);
      
      // Set user in state
      dispatch({ type: 'SET_USER', payload: response.data.user });
      
      toast.success('Welcome!');
      return response;
    } catch (error) {
      const message = error.response?.data?.error?.message || 'Google login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local data
      authService.clearAuthData();
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    user: state.user,
    loading: state.loading,
    error: state.error,
    register,
    login,
    googleLogin,
    logout,
    clearError,
    isAuthenticated: !!state.user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};