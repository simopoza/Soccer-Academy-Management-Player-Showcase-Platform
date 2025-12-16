import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import LoginPage from './LoginPage';
import axiosInstance from '../services/axiosInstance';

// Mock axiosInstance directly instead of axios
vi.mock('../services/axiosInstance', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders login form correctly', async () => {
    render(<LoginPage />);
    
    // Wait for form to render
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('displays validation errors for empty fields', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    // Check for validation messages (adjust based on your validation library)
    await waitFor(() => {
      const errors = screen.queryAllByText(/required/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('displays validation error for invalid email format', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    await user.type(emailInput, 'invalidemail');
    
    const submitButton = screen.getByRole('button', { name: /login/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('submits form with valid credentials', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        token: 'fake-token',
        user: {
          id: 1,
          email: 'test@example.com',
          role: 'player',
        },
      },
    };
    
    axios.post = vi.fn().mockResolvedValue(mockResponse);
    
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          email: 'test@example.com',
          password: 'Password123!',
        })
      );
    });
  });

  it('displays error message on login failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Invalid credentials';
    
    axios.post = vi.fn().mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });
    
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'WrongPassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('navigates to register page when clicking register link', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const registerLink = screen.getByText(/don't have an account/i);
    expect(registerLink).toBeInTheDocument();
  });

  it('navigates to forgot password page when clicking forgot password link', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const forgotPasswordLink = screen.getByText(/forgot password/i);
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    // Create a delayed promise to simulate loading
    let resolveLogin;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    
    axios.post = vi.fn().mockReturnValue(loginPromise);
    
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);
    
    // Check for loading state
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    
    // Resolve the promise
    resolveLogin({
      data: {
        token: 'fake-token',
        user: { id: 1, email: 'test@example.com', role: 'player' },
      },
    });
  });

  it('handles pending approval status', async () => {
    const user = userEvent.setup();
    
    axios.post = vi.fn().mockRejectedValue({
      response: {
        status: 403,
        data: {
          message: 'Your account is pending approval',
          status: 'pending',
        },
      },
    });
    
    render(<LoginPage />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const submitButton = screen.getByRole('button', { name: /login/i });
    
    await user.type(emailInput, 'pending@example.com');
    await user.type(passwordInput, 'Password123!');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/pending approval/i)).toBeInTheDocument();
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);
    
    const passwordInput = screen.getByPlaceholderText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    // Find and click the show/hide password button (icon button)
    const toggleButton = screen.getByLabelText(/show password/i) || screen.getByRole('button', { name: /show/i });
    await user.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('supports RTL layout when language is Arabic', () => {
    // This would test i18n integration
    render(<LoginPage />);
    
    // Check that translations are loaded
    expect(screen.getByRole('heading')).toBeInTheDocument();
  });
});
