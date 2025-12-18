import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgentDashboardPage from '../AgentDashboardPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

describe('AgentDashboardPage', () => {
  it('renders heading and buttons', () => {
    render(
      <MemoryRouter>
        <AgentDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/agentDashboard/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /openMenu/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });
});
