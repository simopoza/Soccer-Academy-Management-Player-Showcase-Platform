import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminMenuPage from '../AdminMenuPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

describe('AdminMenuPage', () => {
  it('renders menu heading', () => {
    render(
      <MemoryRouter>
        <AdminMenuPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/adminMenu/i)).toBeInTheDocument();
  });
});
