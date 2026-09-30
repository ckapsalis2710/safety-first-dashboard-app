import {
  Box,
  Typography,
  IconButton,
  Chip,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  LightMode,
  DarkMode,
  AccountCircle,
} from '@mui/icons-material';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
}

const PageHeader = ({
  title,
  subtitle,
  toggleTheme,
  isDarkMode,
  notificationMenu,
}: PageHeaderProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 4,
        pb: 2,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography color="text.secondary" variant="subtitle1">
            {subtitle}
          </Typography>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <Chip
          label="Live"
          size="small"
          color="success"
          variant="outlined"
          sx={{ fontWeight: 500, mr: 1 }}
        />

        {notificationMenu}

        <Tooltip title={isDarkMode ? 'Light Mode' : 'Dark Mode'}>
          <IconButton size="small" onClick={toggleTheme}>
            {isDarkMode ? <LightMode /> : <DarkMode />}
          </IconButton>
        </Tooltip>

        {/* User Profile Section */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            ml: 1,
            pl: 1.5,
            borderLeft: `1px solid ${theme.palette.divider}`,
          }}
        >
          <IconButton size="small">
            <AccountCircle />
          </IconButton>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                lineHeight: 1.2,
              }}
            >
              Operator
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  display: 'inline-block',
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: theme.palette.success.main,
                  fontWeight: 500,
                  fontSize: '0.6rem',
                }}
              >
                Online
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PageHeader;