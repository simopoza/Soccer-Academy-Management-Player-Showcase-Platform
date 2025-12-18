import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AgentMenuPage from '../AgentMenuPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

describe('AgentMenuPage', () => {
  it('renders menu heading and links', () => {
    render(
      <MemoryRouter>
        <AgentMenuPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/agentMenu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /viewProfile/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /settings/i })).toBeInTheDocument();
  });
});
