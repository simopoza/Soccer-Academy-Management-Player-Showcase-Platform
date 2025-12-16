import { vi } from 'vitest';

const mockAxiosInstance = {
  interceptors: {
    request: {
      use: vi.fn(),
      eject: vi.fn(),
    },
    response: {
      use: vi.fn(),
      eject: vi.fn(),
    },
  },
  get: vi.fn(() => Promise.resolve({ data: {} })),
  post: vi.fn(() => Promise.resolve({ data: {} })),
  put: vi.fn(() => Promise.resolve({ data: {} })),
  delete: vi.fn(() => Promise.resolve({ data: {} })),
  patch: vi.fn(() => Promise.resolve({ data: {} })),
};

const mockAxios = {
  create: vi.fn(() => mockAxiosInstance),
  ...mockAxiosInstance,
};

export default mockAxios;
