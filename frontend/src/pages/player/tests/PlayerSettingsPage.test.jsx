import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlayerSettingsPage from '../PlayerSettingsPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

jest.mock('../../../components/forms/SettingsPage', () => (props) => {
  return <div data-testid="settings-page">SettingsPage-{props.role}</div>;
});

describe('PlayerSettingsPage', () => {
  it('renders settings and includes SettingsPage', () => {
    render(
      <MemoryRouter>
        <PlayerSettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/playerSettings/i)).toBeInTheDocument();
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
  });
});
