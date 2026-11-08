import React, { useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Button,
  Divider,
  Stack,
  Paper,
} from '@mui/material';
import { theme } from './theme';

export const App: React.FC = () => {
  // Screen sequence: 'signin' -> 'consent'
  const [currentScreen, setCurrentScreen] = useState<'signin' | 'consent'>('signin');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#f8fafc', // Soft, clean off-white background to give the box crisp definition
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          px: { xs: 2.5, sm: 4 },
          py: { xs: 4, sm: 8 },
        }}
      >
        {/* Top Header */}
        <Container maxWidth="sm" disableGutters>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              pb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  backgroundColor: '#0f172a',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                }}
              >
                TCC
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: '#0f172a',
                  fontSize: '0.875rem',
                }}
              >
                Clearance System
              </Typography>
            </Box>

            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
              }}
            >
              Tagoloan Community College
            </Typography>
          </Box>
        </Container>

        {/* SCREEN 1: SIGN IN WITH GMAIL (INSIDE SIMPLE SAAS BOX) */}
        {currentScreen === 'signin' && (
          <Container maxWidth="sm" disableGutters sx={{ my: 'auto', py: 4 }}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
                p: { xs: 4, sm: 6 },
              }}
            >
              <Stack spacing={4} sx={{ textAlign: 'center', alignItems: 'center' }}>
                {/* Header text */}
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  >
                    Student Registration · Step 1
                  </Typography>

                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: '#0f172a',
                    }}
                  >
                    Sign in with Gmail
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#64748b',
                      lineHeight: 1.6,
                      maxWidth: 340,
                      pt: 0.5,
                      fontSize: '0.875rem',
                    }}
                  >
                    Register your device to access your TCC event attendance passes and digital clearance card.
                  </Typography>
                </Stack>

                {/* Core Action: Continue with Google Button */}
                <Stack spacing={2} sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => setCurrentScreen('consent')}
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
                      minHeight: 52,
                      borderRadius: 2.5,
                      borderColor: '#cbd5e1',
                      color: '#0f172a',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      backgroundColor: '#ffffff',
                      '&:hover': {
                        borderColor: '#0f172a',
                        backgroundColor: '#f8fafc',
                      },
                    }}
                  >
                    Continue with Google
                  </Button>

                  <Typography
                    variant="caption"
                    sx={{
                      color: '#94a3b8',
                      fontSize: '0.75rem',
                    }}
                  >
                    Use your personal or institutional Gmail address.
                  </Typography>
                </Stack>

                <Divider sx={{ width: '100%', borderColor: '#f1f5f9' }} />

                {/* Subtitle Footnote */}
                <Typography
                  variant="caption"
                  sx={{
                    color: '#94a3b8',
                    display: 'block',
                    fontSize: '0.75rem',
                  }}
                >
                  Baluarte, Tagoloan, Misamis Oriental
                </Typography>
              </Stack>
            </Paper>
          </Container>
        )}

        {/* SCREEN 2: DATA PRIVACY & CONSENT (INSIDE SIMPLE SAAS BOX) */}
        {currentScreen === 'consent' && (
          <Container maxWidth="sm" disableGutters sx={{ my: 'auto', py: 4 }}>
            <Paper
              elevation={0}
              sx={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 4,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -2px rgba(0, 0, 0, 0.03)',
                p: { xs: 4, sm: 6 },
              }}
            >
              <Stack spacing={4} sx={{ textAlign: 'center', alignItems: 'center' }}>
                {/* Header text */}
                <Stack spacing={1} sx={{ alignItems: 'center' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      color: '#64748b',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}
                  >
                    Student Registration · Step 2
                  </Typography>

                  <Typography
                    variant="h5"
                    component="h1"
                    sx={{
                      fontWeight: 600,
                      letterSpacing: '-0.02em',
                      color: '#0f172a',
                    }}
                  >
                    Data Privacy & Consent
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: '#94a3b8',
                      fontSize: '0.7rem',
                    }}
                  >
                    Republic Act No. 10173
                  </Typography>
                </Stack>

                {/* 3-part disclosure inside clean container */}
                <Stack
                  spacing={2.5}
                  sx={{
                    width: '100%',
                    textAlign: 'left',
                    p: 3,
                    borderRadius: 2.5,
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#0f172a',
                        fontSize: '0.725rem',
                        mb: 0.5,
                      }}
                    >
                      What we collect
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem', lineHeight: 1.55 }}>
                      Your full name, school ID number, department, year level, section, and a live front-camera verification photo.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#0f172a',
                        fontSize: '0.725rem',
                        mb: 0.5,
                      }}
                    >
                      Why it is collected
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem', lineHeight: 1.55 }}>
                      Exclusively for verifying event attendance, issuing digital clearance stamps, and preventing card forgery.
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        fontWeight: 700,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        color: '#0f172a',
                        fontSize: '0.725rem',
                        mb: 0.5,
                      }}
                    >
                      Data retention
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.825rem', lineHeight: 1.55 }}>
                      Records are retained solely for the official academic semester clearance cycle and purged upon clearance archiving.
                    </Typography>
                  </Box>
                </Stack>

                {/* Actions */}
                <Stack spacing={1.5} sx={{ width: '100%' }}>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      minHeight: 52,
                      borderRadius: 2.5,
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: '#1e293b',
                      },
                    }}
                  >
                    I Agree & Continue
                  </Button>

                  <Button
                    variant="text"
                    fullWidth
                    onClick={() => setCurrentScreen('signin')}
                    sx={{
                      color: '#64748b',
                      fontSize: '0.8rem',
                      fontWeight: 500,
                      py: 1,
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#0f172a',
                      },
                    }}
                  >
                    Back to Sign In
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Container>
        )}

        {/* Subtle Footer */}
        <Container maxWidth="sm" disableGutters>
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#94a3b8',
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
