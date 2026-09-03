import React, { useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Chip,
  useTheme,
  Avatar,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  Card,
  CardContent,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  CheckCircle,
  Lightbulb,
  Send,
  TrendingUp,
  TrendingDown,
  TrendingFlat,
  Info,
  Source,
  Memory,
  Sensors,
  History,
  Analytics,
} from '@mui/icons-material';
import PageHeader from '../components/common/PageHeader';
import { PageSkeleton } from '../components/skeletons/PageSkeleton';
import { getDashboardData, getIncidentsByWorkerId } from '../data/enrichedData';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';
import type { SelectChangeEvent } from '@mui/material';
import type { ReactNode } from 'react';

interface RecommendationsPageProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
  notificationMenu?: ReactNode;
}

const RecommendationsPage = ({ toggleTheme, isDarkMode, notificationMenu }: RecommendationsPageProps) => {
  const theme = useTheme();
  const loading = useSimulatedLoading(700);
  const data = getDashboardData();
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>(data.workers[0]?.id || '');
  const [sendingStates, setSendingStates] = useState<Record<string, boolean>>({});
  const [sentStates, setSentStates] = useState<Record<string, boolean>>({});

  const selectedWorker = data.workers.find(w => w.id === selectedWorkerId);
  const workerIncidents = selectedWorker ? getIncidentsByWorkerId(selectedWorker.id) : [];

  // Get avatar color
  const getAvatarColor = (name: string) => {
    const colors = [
      '#D32F2F', '#C62828', '#E65100', '#ED6C02', '#2E7D32',
      '#00695C', '#0D47A1', '#1565C0', '#4527A0', '#4A148C',
      '#6A1B9A', '#880E4F', '#AD1457', '#BF360C'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleWorkerChange = (event: SelectChangeEvent) => {
    setSelectedWorkerId(event.target.value);
    setSentStates({});
    setSendingStates({});
  };

  const handleSendRecommendation = (recId: string) => {
    setSendingStates(prev => ({ ...prev, [recId]: true }));
    setTimeout(() => {
      setSendingStates(prev => ({ ...prev, [recId]: false }));
      setSentStates(prev => ({ ...prev, [recId]: true }));
    }, 1000);
  };

  // Generate recommendations based on worker's actual data
  const recommendations = useMemo(() => {
    if (!selectedWorker) return [];
    const recs = [];
    
    // Count PPE violations from incident history
    const ppeViolations = workerIncidents.filter(i => 
      i.type.includes('PPE') || i.type.includes('ppe') || i.type.includes('Violation')
    );
    const ppeViolationCounts: Record<string, number> = {};
    ppeViolations.forEach(i => {
      const key = i.type.replace('PPE ', '').replace('ppe ', '').replace('Violation ', '');
      ppeViolationCounts[key] = (ppeViolationCounts[key] || 0) + 1;
    });

    // ALWAYS check each PPE item - most workers will have at least one missing
    if (!selectedWorker.ppe.helmet) {
      const violations = ppeViolationCounts['helmet'] || Math.floor(Math.random() * 3) + 1;
      recs.push({
        id: 'rec-helmet',
        gap: 'Missing Helmet',
        violations: violations,
        training: 'Head Protection Safety Training',
        priority: 'high',
        source: 'Robot Detection + Wearable Data',
        details: `AI-powered robot detected missing helmet in Zone A on ${violations} occasions`
      });
    }
    if (!selectedWorker.ppe.vest) {
      const violations = ppeViolationCounts['vest'] || Math.floor(Math.random() * 4) + 1;
      recs.push({
        id: 'rec-vest',
        gap: 'Missing High-Vis Vest',
        violations: violations,
        training: 'Visibility & Safety Training',
        priority: 'high',
        source: 'Robot Detection + CCTV',
        details: `Visual detection from Unitree robot patrols on ${violations} occasions`
      });
    }
    if (!selectedWorker.ppe.gloves) {
      const violations = ppeViolationCounts['gloves'] || Math.floor(Math.random() * 2) + 1;
      recs.push({
        id: 'rec-gloves',
        gap: 'Missing Gloves',
        violations: violations,
        training: 'Hand Protection & Grip Safety',
        priority: 'medium',
        source: 'Wearable Sensor Data',
        details: `Wearable device flagged glove absence during machinery operation on ${violations} occasions`
      });
    }
    if (!selectedWorker.ppe.glasses) {
      const violations = ppeViolationCounts['glasses'] || Math.floor(Math.random() * 2) + 1;
      recs.push({
        id: 'rec-glasses',
        gap: 'Missing Safety Glasses',
        violations: violations,
        training: 'Eye Protection & Hazard Awareness',
        priority: 'medium',
        source: 'Incident Log Analysis',
        details: `Historical incident data shows ${violations} correlation(s) with eye injuries`
      });
    }
    if (!selectedWorker.ppe.shoes) {
      const violations = ppeViolationCounts['shoes'] || Math.floor(Math.random() * 2) + 1;
      recs.push({
        id: 'rec-shoes',
        gap: 'Missing Safety Shoes',
        violations: violations,
        training: 'Foot Protection & Slip Prevention',
        priority: 'medium',
        source: 'Incident Log Analysis',
        details: `Slip & fall incidents recorded in wet conditions on ${violations} occasions`
      });
    }

    // Fatigue - only for workers with high fatigue
    if (selectedWorker.fatigue === 'high') {
      const violations = Math.floor(Math.random() * 3) + 1;
      recs.push({
        id: 'rec-fatigue',
        gap: 'High Fatigue Level',
        violations: violations,
        training: 'Fatigue Management & Break Scheduling',
        priority: 'high',
        source: 'Wearable Biometrics',
        details: `Heart rate variability and motion sensors indicate elevated fatigue (${violations} alerts)`
      });
    }

    // Compliance score - only for workers with score < 75
    if (selectedWorker.complianceScore < 75) {
      const level = selectedWorker.complianceScore < 50 ? 'Critical' : 'Low';
      const violations = Math.floor(Math.random() * 4) + 2;
      recs.push({
        id: 'rec-compliance',
        gap: `${level} Overall Compliance (${selectedWorker.complianceScore}%)`,
        violations: violations,
        training: 'Comprehensive PPE & Safety Refresher',
        priority: selectedWorker.complianceScore < 50 ? 'critical' : 'high',
        source: 'Aggregated Safety Data',
        details: `Combined analysis from robot, wearables, and incident logs (${violations} flag(s))`
      });
    }

    // Add a default recommendation for workers with no other gaps but low compliance
    if (recs.length === 0 && selectedWorker.complianceScore < 85) {
      recs.push({
        id: 'rec-general',
        gap: 'General Safety Awareness',
        violations: Math.floor(Math.random() * 2) + 1,
        training: 'Safety Best Practices & PPE Usage',
        priority: 'medium',
        source: 'AI Risk Assessment',
        details: `Proactive recommendation based on ${selectedWorker.role} role and site conditions`
      });
    }

    // If worker has compliance score >= 90 and no other gaps, keep empty
    // (these are the excellent workers)

    return recs;
  }, [selectedWorker, workerIncidents]);

  const mainGaps = recommendations
    .filter(rec => rec.violations > 0)
    .map(rec => ({
      gap: rec.gap,
      violations: rec.violations,
      priority: rec.priority,
    }));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return theme.palette.error.main;
      case 'high': return theme.palette.warning.main;
      case 'medium': return theme.palette.info.main;
      default: return theme.palette.success.main;
    }
  };

  const getComplianceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: '#2E7D32' };
    if (score >= 75) return { label: 'Good', color: '#388E3C' };
    if (score >= 60) return { label: 'Medium', color: '#ED6C02' };
    if (score >= 40) return { label: 'Low', color: '#E65100' };
    return { label: 'Very Low', color: '#C62828' };
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 75) return theme.palette.success.light;
    if (score >= 60) return theme.palette.warning.main;
    if (score >= 40) return theme.palette.warning.dark;
    return theme.palette.error.main;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp sx={{ color: theme.palette.success.main, fontSize: 18 }} />;
      case 'down': return <TrendingDown sx={{ color: theme.palette.error.main, fontSize: 18 }} />;
      default: return <TrendingFlat sx={{ color: theme.palette.warning.main, fontSize: 18 }} />;
    }
  };

  // Data sources
  const dataSources = [
    { name: 'Robot Unitree', icon: Memory, color: '#EF5350', count: '3 detections' },
    { name: 'Wearable Sensors', icon: Sensors, color: '#66BB6A', count: '12 data points' },
    { name: 'Incident Logs', icon: History, color: '#FFA726', count: `${workerIncidents.length} records` },
    { name: 'AI Analysis Engine', icon: Analytics, color: '#42A5F5', count: 'Active' },
  ];

  const complianceLevel = selectedWorker ? getComplianceLevel(selectedWorker.complianceScore) : { label: 'N/A', color: '#757575' };

  return (
    <Box>
      <PageHeader
        title="PPE Recommendations"
        subtitle="AI-powered compliance recommendations for workers"
        toggleTheme={toggleTheme}
        isDarkMode={isDarkMode}
        notificationMenu={notificationMenu}
      />

      {loading ? (
        <PageSkeleton kpiCards={0} chartCount={0} tableRows={5} />
      ) : (
      <React.Fragment>
      {/* Worker Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Select Worker</InputLabel>
              <Select
                value={selectedWorkerId}
                label="Select Worker"
                onChange={handleWorkerChange}
              >
                {data.workers.map((worker) => (
                  <MenuItem key={worker.id} value={worker.id}>
                    {worker.name} ({worker.id})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          {selectedWorker && (
            <Grid size={{ xs: 12, md: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: getAvatarColor(selectedWorker.name),
                    color: '#FFFFFF',
                    fontWeight: 600,
                    borderRadius: '30%',
                  }}
                >
                  {selectedWorker.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                    {selectedWorker.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedWorker.role} • {selectedWorker.site} • {selectedWorker.zone}
                  </Typography>
                </Box>
                <Chip
                  label={`${selectedWorker.complianceScore}% • ${complianceLevel.label}`}
                  sx={{
                    bgcolor: getComplianceColor(selectedWorker.complianceScore) + '25',
                    color: getComplianceColor(selectedWorker.complianceScore),
                    fontWeight: 600,
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {getTrendIcon(selectedWorker.complianceScore > 75 ? 'up' : selectedWorker.complianceScore > 60 ? 'flat' : 'down')}
                  <Typography variant="caption" color="text.secondary">
                    {selectedWorker.complianceScore > 75 ? 'Improving' : selectedWorker.complianceScore > 60 ? 'Stable' : 'Declining'}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {selectedWorker && (
        <Grid container spacing={3}>
          {/* LEFT COLUMN: Compliance Score + Main Gaps + Recommended Training */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Compliance Score */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                  Compliance Score
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          borderRadius: '50%',
                          background: `conic-gradient(
                            ${getComplianceColor(selectedWorker.complianceScore)} 0% ${selectedWorker.complianceScore}%,
                            ${theme.palette.action.hover} ${selectedWorker.complianceScore}% 100%
                          )`,
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: 14,
                          right: 14,
                          bottom: 14,
                          borderRadius: '50%',
                          bgcolor: theme.palette.background.paper,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography variant="h4" sx={{ fontWeight: 700, color: getComplianceColor(selectedWorker.complianceScore) }}>
                          {selectedWorker.complianceScore}%
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            mt: 0.5,
                            color: getComplianceColor(selectedWorker.complianceScore),
                            fontWeight: 700,
                            fontSize: '0.65rem',
                          }}
                        >
                          {complianceLevel.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>

              <Divider />

              {/* Main Gaps */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                  Main Gaps
                </Typography>
                {mainGaps.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <CheckCircle sx={{ fontSize: 40, color: theme.palette.success.main }} />
                    <Typography color="text.secondary" sx={{ mt: 1 }}>
                      No critical gaps found
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {mainGaps.slice(0, 4).map((gap, index) => (
                      <Box key={index}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                            {gap.gap}
                          </Typography>
                          <Chip
                            size="small"
                            label={`${gap.violations} violations/mo`}
                            sx={{
                              bgcolor: getPriorityColor(gap.priority),
                              color: '#FFFFFF',
                              fontSize: '0.5rem',
                              height: 18,
                              fontWeight: 600,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider />

              {/* Recommended Training */}
              <Box>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
                  Recommended Training
                </Typography>
                {recommendations.length === 0 ? (
                  <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                    No training needed
                  </Typography>
                ) : (
                  <Stack spacing={1.5}>
                    {recommendations.slice(0, 4).map((rec, index) => (
                      <Box key={index}>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: theme.palette.text.primary }}>
                          {rec.training}
                        </Typography>
                        <Chip
                          size="small"
                          label={`Priority: ${rec.priority}`}
                          sx={{
                            bgcolor: getPriorityColor(rec.priority),
                            color: '#FFFFFF',
                            fontSize: '0.5rem',
                            height: 18,
                            mt: 0.5,
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* RIGHT COLUMN: Personalized Recommendations + Data Sources */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
              {/* Personalized Recommendations */}
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Lightbulb sx={{ color: theme.palette.warning.main }} />
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                    Personalized Recommendations
                  </Typography>
                </Box>

                {recommendations.length === 0 ? (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    <AlertTitle>All Clear</AlertTitle>
                    No recommendations needed for this worker.
                  </Alert>
                ) : (
                  <Stack spacing={2}>
                    {recommendations.map((rec) => (
                      <Paper
                        key={rec.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderLeft: `4px solid ${getPriorityColor(rec.priority)}`,
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'translateX(4px)',
                          },
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexWrap: 'wrap',
                          gap: 1,
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.text.primary }}>
                            {rec.gap}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {rec.training}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                            <Chip
                              size="small"
                              label={`Priority: ${rec.priority}`}
                              sx={{
                                bgcolor: getPriorityColor(rec.priority),
                                color: '#FFFFFF',
                                fontSize: '0.625rem',
                                height: 20,
                                fontWeight: 600,
                              }}
                            />
                            <Chip
                              size="small"
                              icon={<Source sx={{ fontSize: 14, color: theme.palette.text.primary }} />}
                              label={`Source: ${rec.source}`}
                              variant="outlined"
                              sx={{ 
                                fontSize: '0.625rem', 
                                height: 20,
                                color: theme.palette.text.primary,
                                borderColor: theme.palette.divider,
                              }}
                            />
                          </Box>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            {rec.details}
                          </Typography>
                        </Box>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={sentStates[rec.id] ? <CheckCircle /> : <Send />}
                          onClick={() => handleSendRecommendation(rec.id)}
                          disabled={sendingStates[rec.id] || sentStates[rec.id]}
                          sx={{
                            borderRadius: 2,
                            minWidth: 100,
                            alignSelf: 'center',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[4],
                            },
                            transition: 'transform 0.2s, box-shadow 0.2s',
                          }}
                        >
                          {sendingStates[rec.id] ? 'Sending...' : sentStates[rec.id] ? 'Sent ✓' : 'Send'}
                        </Button>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Data Sources */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Info sx={{ color: theme.palette.info.main }} />
                  <Typography variant="h6" sx={{ color: theme.palette.text.primary }}>
                    Data Sources
                  </Typography>
                </Box>
                <Grid container spacing={2}>
                  {dataSources.map((source) => {
                    const Icon = source.icon;
                    return (
                      <Grid size={{ xs: 6, md: 3 }} key={source.name}>
                        <Card variant="outlined" sx={{ height: '100%', bgcolor: 'transparent' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Icon sx={{ fontSize: 28, color: source.color }} />
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 600,
                                color: source.color,
                                mt: 0.5,
                              }}
                            >
                              {source.name}
                            </Typography>
                            <Chip
                              size="small"
                              label={source.count}
                              sx={{
                                mt: 0.5,
                                fontSize: '0.5rem',
                                height: 18,
                                color: source.color,
                                borderColor: source.color,
                                bgcolor: source.color + '20',
                                fontWeight: 600,
                              }}
                              variant="outlined"
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}
      </React.Fragment>
      )}
    </Box>
  );
};

export default RecommendationsPage;