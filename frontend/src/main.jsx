import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import "./i18n";
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import theme from './theme'
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>
)
