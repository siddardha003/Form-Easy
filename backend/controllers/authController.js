import User from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { OAuth2Client } from 'google-auth-library';

// Initialize Google OAuth client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Create user
    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      isEmailVerified: false // In production, you'd send verification email
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      data: {
        token,
        user: user.getPublicProfile()
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REGISTRATION_ERROR',
        message: 'Error creating user account'
      }
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists and include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: user.getPublicProfile()
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGIN_ERROR',
        message: 'Error during login'
      }
    });
  }
};

// @desc    Google OAuth login/register
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'GOOGLE_NOT_CONFIGURED',
          message: 'Google OAuth is not configured'
        }
      });
    }

    // Verify Google token
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, given_name: firstName, family_name: lastName, picture: avatar } = payload;

    // Check if user exists with this Google ID
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with this email (manual registration)
      user = await User.findOne({ email });
      
      if (user) {
        // Link Google account to existing user
        user.googleId = googleId;
        user.avatar = avatar;
        user.isEmailVerified = true;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email,
          firstName,
          lastName: lastName || '',
          googleId,
          avatar,
          isEmailVerified: true
        });
      }
    } else {
      // Update avatar if changed
      if (user.avatar !== avatar) {
        user.avatar = avatar;
        await user.save();
      }
    }

    // Generate token
    const jwtToken = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token: jwtToken,
        user: user.getPublicProfile()
      },
      message: 'Google authentication successful'
    });
  } catch (error) {
    console.error('Google auth error:', error);
    
    if (error.message.includes('Token used too early') || error.message.includes('Invalid token')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_GOOGLE_TOKEN',
          message: 'Invalid Google token'
        }
      });
    }

    res.status(500).json({
      success: false,
      error: {
        code: 'GOOGLE_AUTH_ERROR',
        message: 'Error during Google authentication'
      }
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'GET_USER_ERROR',
        message: 'Error fetching user data'
      }
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  try {
    // In a more sophisticated setup, you might maintain a blacklist of tokens
    // For now, we'll just send a success response
    // The frontend should remove the token from storage
    
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'LOGOUT_ERROR',
        message: 'Error during logout'
      }
    });
  }
};

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
export const refreshToken = async (req, res) => {
  try {
    // Generate new token for the authenticated user
    const token = generateToken(req.user._id);
    
    res.json({
      success: true,
      data: {
        token,
        user: req.user.getPublicProfile()
      },
      message: 'Token refreshed successfully'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'REFRESH_ERROR',
        message: 'Error refreshing token'
      }
    });
  }
};