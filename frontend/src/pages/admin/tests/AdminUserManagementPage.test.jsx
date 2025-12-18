import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminUserManagementPage from '../AdminUserManagementPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (k) => k, i18n: { language: 'en' } }),
}));

describe('AdminUserManagementPage', () => {
  it('renders user management heading', () => {
    render(
      <MemoryRouter>
        <AdminUserManagementPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/adminUserManagement/i)).toBeInTheDocument();
  });
});
