/* eslint-disable react-refresh/only-export-components */
import { render } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { AuthProvider } from '../context/AuthContext';
import i18n from '../i18n';

// Lightweight wrapper without Layout component for faster tests
const AllTheProviders = ({ children }) => {
  return (
    <ChakraProvider>
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <AuthProvider>
            {children}
          </AuthProvider>
        </BrowserRouter>
      </I18nextProvider>
    </ChakraProvider>
  );
};

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything with increased default timeout
export * from '@testing-library/react';
export { customRender as render };

// Custom waitFor with longer timeout
export { waitFor } from '@testing-library/react';
