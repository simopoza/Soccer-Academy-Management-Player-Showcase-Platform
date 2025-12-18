import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgentProfilePage from '../AgentProfilePage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

// Mock AuthContext
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ user: { first_name: 'Test', last_name: 'Agent', email: 'a@test.com' } }),
}));

describe('AgentProfilePage', () => {
  it('renders profile info and edit button', () => {
    render(
      <MemoryRouter>
        <AgentProfilePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/agentProfile/i)).toBeInTheDocument();
    expect(screen.getByText(/Test Agent/)).toBeInTheDocument();
    expect(screen.getByText(/a@test.com/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /editProfile/i })).toBeInTheDocument();
  });
});
