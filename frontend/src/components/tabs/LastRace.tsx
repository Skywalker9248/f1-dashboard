import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import API from '../../axios';
import {
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Chip,
} from '@mui/material';

interface SessionInfo {
  circuit: string;
  location: string;
  country: string;
  date: string;
  sessionName: string;
  sessionType: string;
}

interface Standing {
  position: number;
  driver: string;
  driverAcronym: string;
  driverNumber: number;
  team: string;
  teamColor: string;
  points: number;
  headshotUrl?: string;
  countryCode?: string;
  dnf: boolean;
  dns: boolean;
  dsq: boolean;
  gapToLeader: number;
  numberOfLaps: number;
}

interface LastRaceData {
  sessionInfo: SessionInfo;
  standings: Standing[];
}

const LastRace = () => {
  const [data, setData] = useState<LastRaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get('/api/f1/last-race')
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="warning">No data available</Alert>;

  const { sessionInfo, standings } = data;

  // Sort standings: finished drivers first (by position), then DNF/DNS/DSQ at the bottom
  const sortedStandings = [...standings].sort((a, b) => {
    const aDidNotFinish = a.dnf || a.dns || a.dsq;
    const bDidNotFinish = b.dnf || b.dns || b.dsq;
    
    // If one finished and one didn't, finished comes first
    if (!aDidNotFinish && bDidNotFinish) return -1;
    if (aDidNotFinish && !bDidNotFinish) return 1;
    
    // Both finished or both didn't finish, sort by position
    return a.position - b.position;
  });

  const chartOption = {
    title: { text: 'Race Results', left: 'center' },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        const standing = sortedStandings[dataIndex];
        return `${standing.driver}<br/>Points: ${standing.points}<br/>Team: ${standing.team}`;
      },
    },
    xAxis: {
      type: 'category',
      data: sortedStandings.map((d) => d.driverAcronym),
      axisLabel: { rotate: 45, interval: 0 },
    },
    yAxis: { type: 'value', name: 'Points' },
    series: [
      {
        name: 'Points',
        type: 'bar',
        data: sortedStandings.map((d) => ({ value: d.points, itemStyle: { color: `#${d.teamColor || '1976d2'}` } })),
        label: { show: true, position: 'top' },
      },
    ],
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Session Information */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: '#f5f5f5' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
              {sessionInfo.sessionName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {sessionInfo.circuit} - {sessionInfo.country}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: { md: 'right' } }}>
            <Typography variant="h6">{formatDate(sessionInfo.date)}</Typography>
            <Typography variant="body2" color="text.secondary">
              {sessionInfo.location}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Table */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
              Race Results
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Pos</strong></TableCell>
                    <TableCell><strong>Driver</strong></TableCell>
                    <TableCell><strong>Team</strong></TableCell>
                    <TableCell align="right"><strong>Points</strong></TableCell>
                    <TableCell align="right"><strong>Gap</strong></TableCell>
                    <TableCell align="center"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedStandings.map((row, index) => (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 4, height: 24, backgroundColor: `#${row.teamColor}`, borderRadius: 1 }} />
                          {row.position}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{row.driver}</Typography>
                          <Typography variant="caption" color="text.secondary">#{row.driverNumber} • {row.driverAcronym}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell align="right"><strong>{row.points}</strong></TableCell>
                      <TableCell align="right">
                        {row.position === 1 ? '-' : `+${row.gapToLeader.toFixed(3)}s`}
                      </TableCell>
                      <TableCell align="center">
                        {row.dnf && <Chip label="DNF" size="small" color="error" />}
                        {row.dns && <Chip label="DNS" size="small" color="warning" />}
                        {row.dsq && <Chip label="DSQ" size="small" color="error" />}
                        {!row.dnf && !row.dns && !row.dsq && <Chip label="Finished" size="small" color="success" />}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Chart - Full Width */}
      <Box sx={{ 
        width: '100vw',
        position: 'relative',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        mt: 4
      }}>
        <Paper sx={{ height: 600, p: 2, borderRadius: 0 }}>
          <ReactECharts option={chartOption} style={{ height: '100%', width: '100%' }} />
        </Paper>
      </Box>
    </Box>
  );
};

export default LastRace;
