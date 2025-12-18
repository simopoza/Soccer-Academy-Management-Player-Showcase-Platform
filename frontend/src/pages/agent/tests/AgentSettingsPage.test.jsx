import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgentSettingsPage from '../AgentSettingsPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

// Mock SettingsPage component used inside AgentSettingsPage
jest.mock('../../../components/forms/SettingsPage', () => (props) => {
  return <div data-testid="settings-page">SettingsPage-{props.role}</div>;
});

describe('AgentSettingsPage', () => {
  it('renders settings heading and includes SettingsPage', () => {
    render(
      <MemoryRouter>
        <AgentSettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/agentSettings/i)).toBeInTheDocument();
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
  });
});
