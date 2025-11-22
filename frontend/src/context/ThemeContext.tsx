import React, { createContext, useState, useMemo, useEffect, useContext } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  toggleColorMode: () => void;
  mode: ColorMode;
}

const ColorModeContext = createContext<ColorModeContextType>({
  toggleColorMode: () => {},
  mode: 'light',
});

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [mode, setMode] = useState<ColorMode>(() => {
    const savedMode = localStorage.getItem('themeMode');
    return (savedMode as ColorMode) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
      },
      mode,
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === 'light'
            ? {
                // Light mode palette
                primary: {
                  main: '#E10600', // F1 Red
                },
                background: {
                  default: '#f3f3f3',
                  paper: '#ffffff',
                },
              }
            : {
                // Dark mode palette
                primary: {
                  main: '#E10600', // F1 Red
                },
                background: {
                  default: '#15151e', // Dark background
                  paper: '#1e1e26', // Slightly lighter for cards
                },
              }),
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
