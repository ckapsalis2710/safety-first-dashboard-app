import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { Search, Visibility } from '@mui/icons-material';
import WorkerDetails from './WorkerDetails';
import type { Worker } from '../../types';

interface WorkersSectionProps {
  workers: Worker[];
}

const WorkersSection = ({ workers }: WorkersSectionProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState(0);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const filteredWorkers = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase();

    return workers
      .filter(
        (worker) =>
          worker.name.toLowerCase().includes(normalizedSearchTerm) ||
          worker.role.toLowerCase().includes(normalizedSearchTerm) ||
          worker.site.toLowerCase().includes(normalizedSearchTerm) ||
          worker.zone.toLowerCase().includes(normalizedSearchTerm)
      )
      .filter((worker) => {
        if (filterTab === 0) return true;
        if (filterTab === 1) return worker.compliant;
        if (filterTab === 2) return !worker.compliant;

        return true;
      });
  }, [workers, searchTerm, filterTab]);

  const selectedWorker = useMemo(() => {
    return workers.find((worker) => worker.id === selectedWorkerId) ?? null;
  }, [workers, selectedWorkerId]);

  // Get avatar colors based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      '#D32F2F', '#C62828', '#E65100', '#ED6C02', '#2E7D32',
      '#00695C', '#0D47A1', '#1565C0', '#4527A0', '#4A148C',
      '#6A1B9A', '#880E4F', '#AD1457', '#BF360C'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <Grid size={{ xs: 12, md: 8 }}>
      <Paper sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            mb: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: theme.palette.text.primary }}
          >
            Workers
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <TextField
              size="small"
              placeholder="Search workers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: '0 1 260px' }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                variant={filterTab === 0 ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilterTab(0)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  borderRadius: 1.5,
                  bgcolor:
                    filterTab === 0
                      ? theme.palette.primary.main
                      : 'transparent',
                  color:
                    filterTab === 0
                      ? '#FFFFFF'
                      : theme.palette.text.primary,
                  borderColor:
                    filterTab === 0
                      ? 'transparent'
                      : theme.palette.divider,
                  '&:hover': {
                    bgcolor:
                      filterTab === 0
                        ? theme.palette.primary.dark
                        : theme.palette.action.hover,
                  },
                }}
              >
                All
              </Button>

              <Button
                variant={filterTab === 1 ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilterTab(1)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  borderRadius: 1.5,
                  bgcolor:
                    filterTab === 1
                      ? theme.palette.success.main
                      : 'transparent',
                  color:
                    filterTab === 1
                      ? '#FFFFFF'
                      : theme.palette.text.primary,
                  borderColor:
                    filterTab === 1
                      ? 'transparent'
                      : theme.palette.divider,
                  '&:hover': {
                    bgcolor:
                      filterTab === 1
                        ? theme.palette.success.dark
                        : theme.palette.action.hover,
                  },
                }}
              >
                Compliant
              </Button>

              <Button
                variant={filterTab === 2 ? 'contained' : 'outlined'}
                size="small"
                onClick={() => setFilterTab(2)}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  fontSize: '0.75rem',
                  borderRadius: 1.5,
                  bgcolor:
                    filterTab === 2
                      ? theme.palette.error.main
                      : 'transparent',
                  color:
                    filterTab === 2
                      ? '#FFFFFF'
                      : theme.palette.text.primary,
                  borderColor:
                    filterTab === 2
                      ? 'transparent'
                      : theme.palette.divider,
                  '&:hover': {
                    bgcolor:
                      filterTab === 2
                        ? theme.palette.error.dark
                        : theme.palette.action.hover,
                  },
                }}
              >
                Non-Compliant
              </Button>
            </Box>
          </Box>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Zone</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredWorkers.map((worker) => {
                const isSelected = selectedWorkerId === worker.id;

                return (
                  <TableRow
                    key={worker.id}
                    hover
                    onClick={() => setSelectedWorkerId(worker.id)}
                    sx={{
                      cursor: 'pointer',
                      bgcolor: isSelected
                        ? theme.palette.action.selected
                        : 'transparent',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        bgcolor: isSelected
                          ? theme.palette.action.selected
                          : theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: getAvatarColor(worker.name),
                            color: '#FFFFFF',
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: '30%',
                          }}
                        >
                          {worker.name
                            .split(' ')
                            .map((namePart) => namePart[0])
                            .join('')}
                        </Avatar>

                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 500,
                              color: theme.palette.text.primary,
                            }}
                          >
                            {worker.name}
                          </Typography>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {worker.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>

                    <TableCell
                      sx={{ color: theme.palette.text.primary }}
                    >
                      {worker.role}
                    </TableCell>

                    <TableCell
                      sx={{ color: theme.palette.text.primary }}
                    >
                      {worker.zone}
                    </TableCell>

                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={worker.compliant ? 'OK' : 'Not OK'}
                        color={worker.compliant ? 'success' : 'error'}
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/workers?workerId=${worker.id}`);
                        }}
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <WorkerDetails worker={selectedWorker} />
        </Box>
      </Paper>
    </Grid>
  );
};

export default WorkersSection;