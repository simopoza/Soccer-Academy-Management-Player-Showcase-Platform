import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlayerDashboardPage from '../PlayerDashboardPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

describe('PlayerDashboardPage', () => {
  it('renders player dashboard heading', () => {
    render(
      <MemoryRouter>
        <PlayerDashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/playerDashboard/i)).toBeInTheDocument();
  });
});
