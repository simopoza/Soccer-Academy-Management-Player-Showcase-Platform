import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CompleteProfilePage from '../CompleteProfilePage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

// Mock playerService
jest.mock('../../../services/playerService', () => ({
  getTeams: async () => [{ id: 1, name: 'A Team', age_limit: 18 }],
  getCurrentPlayer: async () => ({ id: 42 }),
  completeProfile: async () => ({}),
}));

jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { profile_completed: false }, updateUser: jest.fn() }),
}));

describe('CompleteProfilePage', () => {
  it('renders and fetches teams', async () => {
    render(
      <MemoryRouter>
        <CompleteProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/completeProfile/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByPlaceholderText(/Select your team/i)).toBeInTheDocument());
  });
});
