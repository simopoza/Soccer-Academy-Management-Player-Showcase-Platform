import { extendTheme } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
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
        bg: props.colorMode === 'dark' ? 'gray.900' : 'white',
        color: props.colorMode === 'dark' ? 'white' : 'gray.800',
      },
    }),
  },
  colors: {
    brand: {
      50: '#e6f7ed',
      100: '#c2ebd4',
      200: '#9ddfba',
      300: '#77d3a0',
      400: '#52c786',
      500: '#38b16c',
      600: '#2d8a55',
      700: '#22643e',
      800: '#173d27',
      900: '#0c1710',
    },
  },
});

export default theme;
