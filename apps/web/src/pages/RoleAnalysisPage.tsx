import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import PageHeader from '../components/common/PageHeader';
import { getRoleStats } from '../data/enrichedData';
import type { ViolationItem } from '../types';
import { PageSkeleton } from '../components/skeletons/PageSkeleton';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { ReactNode } from 'react';

interface RoleAnalysisPageProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
}

const RoleAnalysisPage = ({ toggleTheme, isDarkMode, notificationMenu }: RoleAnalysisPageProps) => {
  const theme = useTheme();
  const loading = useSimulatedLoading(700);

  // Get role stats from enriched data
  const roleStats = getRoleStats();

  // Colors for violation chips
  const violationColors = [
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.success.main,
  ];

  // Get color based on compliance value
  const getComplianceColor = (value: number) => {
    if (value >= 80) return theme.palette.success.main;
    if (value >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Get color based on violation percentage
  const getViolationColor = (percentage: number) => {
    if (percentage >= 70) return theme.palette.error.main;
    if (percentage >= 50) return theme.palette.warning.main;
    if (percentage >= 30) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Sort roles by compliance rate (descending)
  const sortedRoles = useMemo(() => {
    return [...roleStats].sort((a, b) => b.complianceRate - a.complianceRate);
  }, [roleStats]);

  // Sort roles by violation percentage (descending) for violations section
  const topViolationRoles = useMemo(() => {
    return [...roleStats]
      .filter(role => role.topViolations.length > 0)
      .map(role => {
        // Calculate total violations for this role
        const totalViolations = role.topViolations.reduce(
          (acc, v) => acc + (typeof v === 'string' ? 1 : (v.count || 1)), 
          0
        );
        // Calculate highest violation percentage for this role
        const highestPercentage = Math.max(
          ...role.topViolations.map(v => {
            const count = typeof v === 'string' ? 1 : (v.count || 1);
            return Math.round((count / totalViolations) * 100);
          })
        );
        return {
          ...role,
          totalViolations,
          highestPercentage,
        };
      })
      .sort((a, b) => b.highestPercentage - a.highestPercentage)
      .slice(0, 5);
  }, [roleStats]);

  // Prepare compliance data for horizontal bar chart
  const complianceData = useMemo(() => {
    return sortedRoles.map((role) => ({
      name: role.role,
      compliance: role.complianceRate,
      color: getComplianceColor(role.complianceRate),
    }));
  }, [sortedRoles]);

  // Get total violations for a role
  const getTotalViolations = (role: typeof roleStats[0]) => {
    return role.topViolations.reduce(
      (acc, v) => acc + (typeof v === 'string' ? 1 : (v.count || 1)), 
      0
    );
  };

  // Get violation percentage
  const getViolationPercentage = (role: typeof roleStats[0], violation: string | ViolationItem) => {
    const total = getTotalViolations(role);
    const count = typeof violation === 'string' ? 1 : (violation.count || 1);
    return Math.round((count / total) * 100);
  };

  // Get violation name
  const getViolationName = (violation: string | ViolationItem) => {
    return typeof violation === 'string' ? violation : violation.name;
  };

  // Custom label formatter for BarChart
  const formatLabel = (value: unknown) => {
    return value != null ? `${value}%` : '';
  };

  return (
    <Box>
      <PageHeader
        title="Role Analysis"
        subtitle="Compare compliance across different roles"
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationMenu={notificationMenu}
      />

      {loading ? (
        <PageSkeleton chartCount={2} tableRows={5} />
      ) : (
      <React.Fragment>
      {/* Charts Section */}
      <Grid container spacing={3}>
        {/* Compliance Horizontal Bar Chart */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Compliance Rate by Role
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={complianceData}
                layout="vertical"
                margin={{ top: 10, right: 60, left: 80, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} horizontal={false} />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  stroke={theme.palette.text.secondary}
                  tickFormatter={(value) => `${value}%`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke={theme.palette.text.secondary}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                    color: theme.palette.text.primary,
                  }}
                  formatter={(value) => [`${value}%`, 'Compliance']}
                  itemStyle={{
                    color: theme.palette.text.primary,
                  }}
                  labelStyle={{
                    color: theme.palette.text.primary,
                  }}
                />
                <Bar
                  dataKey="compliance"
                  name="Compliance %"
                  label={{
                    position: 'right',
                    formatter: formatLabel,
                    fill: theme.palette.text.primary,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {complianceData.map((entry) => (
                    <Cell key={`cell-${entry.name}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Violations per Role - Sorted by percentage */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Violations by Role
            </Typography>
            {topViolationRoles.length === 0 ? (
              <Typography color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No violations recorded
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {topViolationRoles.map((role) => {
                  // Get the highest percentage for this role
                  const highestPercentage = Math.max(
                    ...role.topViolations.map(v => getViolationPercentage(role, v))
                  );
                  const borderColor = getViolationColor(highestPercentage);
                  return (
                    <Paper
                      key={role.role}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        borderLeft: `4px solid ${borderColor}`,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {role.role}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${role.incidents} incidents`}
                          color="warning"
                          variant="outlined"
                          sx={{ fontSize: '0.625rem', height: 20 }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {role.topViolations.map((violation) => {
                          const violationName = getViolationName(violation);
                          const percentage = getViolationPercentage(role, violation);
                          const colorIndex = (role.topViolations.indexOf(violation) + 1) % violationColors.length;
                          return (
                            <Chip
                              key={violationName}
                              size="small"
                              label={`${violationName} ${percentage}%`}
                              sx={{
                                bgcolor: violationColors[colorIndex],
                                color: '#FFFFFF',
                                fontWeight: 600,
                                fontSize: '0.625rem',
                                height: 22,
                              }}
                            />
                          );
                        })}
                      </Box>
                    </Paper>
                  );
                })}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Detailed Role Stats Table */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Role Statistics Details
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Workers</TableCell>
                    <TableCell align="center">Compliance %</TableCell>
                    <TableCell align="center">Incidents / Month</TableCell>
                    <TableCell align="center">Total Incidents</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedRoles.map((role) => {
                    // Calculate incidents per month (mock data based on incidents count)
                    const incidentsPerMonth = Math.round(role.incidents / 6);
                    return (
                      <TableRow key={role.role} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{role.role}</TableCell>
                        <TableCell align="center">{role.workers}</TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${role.complianceRate}%`}
                            sx={{
                              bgcolor: getComplianceColor(role.complianceRate),
                              color: '#FFFFFF',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            size="small"
                            label={`${incidentsPerMonth}/mo`}
                            color={incidentsPerMonth > 2 ? 'error' : incidentsPerMonth > 0 ? 'warning' : 'success'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="center">{role.incidents}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
      </React.Fragment>
      )}
    </Box>
  );
};

export default RoleAnalysisPage;