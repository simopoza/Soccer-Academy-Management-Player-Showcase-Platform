import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminAnalyticsPage from '../AdminAnalyticsPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

describe('AdminAnalyticsPage', () => {
  it('renders analytics heading', () => {
    render(
      <MemoryRouter>
        <AdminAnalyticsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/adminAnalytics/i)).toBeInTheDocument();
  });
});
