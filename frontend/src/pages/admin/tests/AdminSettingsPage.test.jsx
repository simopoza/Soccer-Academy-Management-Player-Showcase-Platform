import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminSettingsPage from '../AdminSettingsPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

jest.mock('../../../components/forms/SettingsPage', () => (props) => {
  return <div data-testid="settings-page">SettingsPage-{props.role}</div>;
});

describe('AdminSettingsPage', () => {
  it('renders settings page and includes SettingsPage', () => {
    render(
      <MemoryRouter>
        <AdminSettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/adminSettings/i)).toBeInTheDocument();
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
  });
});
