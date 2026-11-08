import React from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Divider,
  Stack,
} from '@mui/material';
import { theme } from './theme';

export const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: { xs: 3, sm: 6 },
          py: { xs: 6, sm: 10 },
        }}
      >
        {/* Top Header - Pure whitespace with quiet institutional branding */}
        <Container maxWidth="xs" disableGutters>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                letterSpacing: '0.18em',
                color: '#0a0a0a',
                textTransform: 'uppercase',
              }}
            >
              TCC
            </Typography>
            <Typography
              variant="caption"
              sx={{
                letterSpacing: '0.06em',
                color: 'text.secondary',
              }}
            >
              Clearance System
            </Typography>
          </Box>
        </Container>

        {/* Main Stage - Generous white spaces, task-oriented action-first */}
        <Container maxWidth="xs" disableGutters sx={{ my: 'auto', py: { xs: 8, sm: 12 } }}>
          <Stack spacing={6} sx={{ alignItems: 'center', textAlign: 'center' }}>
            {/* Title & Description with low cognitive load */}
            <Stack spacing={1.5} sx={{ alignItems: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'text.secondary',
                  fontWeight: 600,
                }}
              >
                Student Registration
              </Typography>

              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 300,
                  letterSpacing: '-0.02em',
                  color: 'text.primary',
                  lineHeight: 1.2,
                }}
              >
                Sign in with Gmail
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  lineHeight: 1.6,
                  maxWidth: 320,
                  pt: 0.5,
                }}
              >
                Register your device to access your TCC event attendance passes and digital clearance card.
              </Typography>
            </Stack>

            {/* Single Core Action: Continue with Google */}
            <Stack spacing={2} sx={{ width: '100%' }}>
              <Button
                variant="outlined"
                fullWidth
                startIcon={
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                }
                sx={{
                  py: 1.75,
                  fontSize: '0.925rem',
                }}
              >
                Continue with Google
              </Button>

              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                Use your personal or institutional Gmail address.
              </Typography>
            </Stack>

            {/* Subtle Divider & Location Footnote */}
            <Box sx={{ width: '100%', pt: 2 }}>
              <Divider sx={{ mb: 4, borderColor: '#f5f5f5' }} />
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: 'block',
                  lineHeight: 1.5,
                }}
              >
                Tagoloan Community College · Baluarte, Tagoloan, Misamis Oriental
              </Typography>
            </Box>
          </Stack>
        </Container>

        {/* Quiet Footer with Privacy Reference */}
        <Container maxWidth="xs" disableGutters>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: 'text.secondary',
              fontSize: '0.725rem',
            }}
          >
            Compliant with RA 10173 (Data Privacy Act of 2012)
          </Typography>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default App;
