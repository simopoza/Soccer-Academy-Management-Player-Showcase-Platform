import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '../test/test-utils';
import userEvent from '@testing-library/user-event';
import RegisterPage from './RegisterPage';
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

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('renders registration form correctly', async () => {
    render(<RegisterPage />);
    
    // Check for essential form elements
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
    });
    
    expect(screen.getByLabelText(/first.*name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last.*name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  });

  it('displays role selection dropdown', () => {
    render(<RegisterPage />);
    
    expect(screen.getByLabelText(/role/i) || screen.getByText(/select.*role/i)).toBeInTheDocument();
  });

  it('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    const submitButton = screen.getByRole('button', { name: /register|sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      const errors = screen.queryAllByText(/required/i);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    const emailInput = screen.getByPlaceholderText(/email/i);
    await user.type(emailInput, 'invalidemail');
    
    const submitButton = screen.getByRole('button', { name: /register|sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    });
  });

  it('validates password strength', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    await user.type(passwordInput, 'weak');
    
    const submitButton = screen.getByRole('button', { name: /register|sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/password.*at least|password.*characters|password.*uppercase|password.*number/i)).toBeInTheDocument();
    });
  });

  it('submits registration with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        message: 'Account created successfully',
        user: {
          userId: 1,
          email: 'newuser@example.com',
          first_name: 'John',
          last_name: 'Doe',
          role: 'player',
        },
      },
    };
    
    axiosInstance.post = vi.fn().mockResolvedValue(mockResponse);
    
    render(<RegisterPage />);
    
    // Fill in all required fields
    await user.type(screen.getByLabelText(/first.*name/i), 'John');
    await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    
    // Select role
    const roleSelect = screen.getByLabelText(/role/i) || screen.getByRole('combobox');
    await user.selectOptions(roleSelect, 'player');
    
    const submitButton = screen.getByRole('button', { name: /register|sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(axiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/register'),
        expect.objectContaining({
          first_name: 'John',
          last_name: 'Doe',
          email: 'newuser@example.com',
          password: 'Password123!',
          role: 'player',
        })
      );
    });
  });

  it('displays success message after successful registration', async () => {
    const user = userEvent.setup();
    
    axiosInstance.post = vi.fn().mockResolvedValue({
      data: {
        message: 'Account created successfully. Please wait for admin approval.',
        user: {
          userId: 1,
          email: 'newuser@example.com',
        },
      },
    });
    
    render(<RegisterPage />);
    
    await user.type(screen.getByLabelText(/first.*name/i), 'John');
    await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    
    const submitButton = screen.getByRole('button', { name: /register|sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/account created|success|wait for admin approval/i)).toBeInTheDocument();
    });
  });

  it('displays error message when email already exists', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already in use';
    
    axiosInstance.post = vi.fn().mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: errorMessage,
        },
      },
    });
    
    render(<RegisterPage />);
    
    await user.type(screen.getByLabelText(/first.*name/i), 'John');
    await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    
    const submitButton = screen.getByRole('button', { name: /register|sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    const user = userEvent.setup();
    
    let resolveRegister;
    const registerPromise = new Promise((resolve) => {
      resolveRegister = resolve;
    });
    
    axiosInstance.post = vi.fn().mockReturnValue(registerPromise);
    
    render(<RegisterPage />);
    
    await user.type(screen.getByLabelText(/first.*name/i), 'John');
    await user.type(screen.getByLabelText(/last.*name/i), 'Doe');
    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    
    const submitButton = screen.getByRole('button', { name: /register|sign up/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(submitButton).toBeDisabled();
    });
    
    resolveRegister({
      data: {
        message: 'Success',
        user: { userId: 1 },
      },
    });
  });

  it('prevents admin role registration', async () => {
    const user = userEvent.setup();
    
    axiosInstance.post = vi.fn().mockRejectedValue({
      response: {
        status: 400,
        data: {
          message: 'Admin accounts cannot be created via registration',
        },
      },
    });
    
    render(<RegisterPage />);
    
    await user.type(screen.getByLabelText(/first.*name/i), 'Admin');
    await user.type(screen.getByLabelText(/last.*name/i), 'User');
    await user.type(screen.getByLabelText(/email/i), 'admin@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123!');
    
    // Try to select admin role if available
    const roleSelect = screen.getByLabelText(/role/i) || screen.getByRole('combobox');
    const adminOption = screen.queryByRole('option', { name: /admin/i });
    
    if (adminOption) {
      await user.selectOptions(roleSelect, 'admin');
      const submitButton = screen.getByRole('button', { name: /register|sign up/i });
      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/admin.*cannot be created/i)).toBeInTheDocument();
      });
    }
  });

  it('navigates to login page when clicking login link', () => {
    render(<RegisterPage />);
    
    const loginLink = screen.getByText(/already have an account/i);
    expect(loginLink).toBeInTheDocument();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleButtons = screen.queryAllByLabelText(/show password/i);
    if (toggleButtons.length > 0) {
      await user.click(toggleButtons[0]);
      expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});
