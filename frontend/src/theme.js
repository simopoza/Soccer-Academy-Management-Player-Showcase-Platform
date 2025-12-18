import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

// Design tokens based on the admin dashboard design
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

const theme = extendTheme({ 
  config,
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: "Inter, system-ui, sans-serif",
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  colors: {
    brand: {
      50: '#DCFCE7',  // green-100 (primary soft)
      100: '#BBF7D0',
      200: '#86EFAC',
      300: '#4ADE80',
      400: '#22C55E',
      500: '#16A34A',  // green-600 (primary)
      600: '#15803D',
      700: '#166534',
      800: '#14532D',
      900: '#052E16',
    },
    gray: {
      50: '#F8FAFC',   // bg-page
      100: '#F1F5F9',  // bg-muted
      200: '#E2E8F0',  // border
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',  // text-secondary
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',  // text-primary
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: '500',
        borderRadius: '8px',
      },
      sizes: {
        md: {
          h: '40px',
          fontSize: 'sm',
        },
      },
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: '8px',
        },
      },
      sizes: {
        md: {
          field: {
            h: '40px',
          },
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          borderRadius: '8px',
        },
      },
      sizes: {
        md: {
          field: {
            h: '40px',
          },
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
          border: '1px solid',
          borderColor: 'gray.200',
        },
      },
    },
  },
  spacing,
});

export default theme;
