import { useEffect, useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ReactECharts from 'echarts-for-react';

interface DriverStanding {
  position: number;
  driver: string;
  driverAcronym: string;
  driverNumber: number;
  team: string;
  teamColor: string;
  points: number;
  headshotUrl?: string;
}

interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
}

const OverallStandings = () => {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch('http://localhost:5000/api/f1/standings/drivers').then((res) => res.json()),
      fetch('http://localhost:5000/api/f1/standings/constructors').then((res) => res.json()),
    ])
      .then(([driversResponse, constructorsResponse]) => {
        // Handle new response format with season info
        const drivers = driversResponse.standings || driversResponse;
        const constructors = constructorsResponse.standings || constructorsResponse;
        setDriverStandings(drivers);
        setConstructorStandings(constructors);
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

  const displayedDrivers = showAllDrivers ? driverStandings : driverStandings.slice(0, 10);

  const driverChartOption = {
    title: {
      text: 'Driver Championship Points',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' },
    },
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '1%', right: '1%', bottom: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: driverStandings.slice(0, 10).map((d) => d.driverAcronym),
      axisLabel: { rotate: 45, interval: 0 },
    },
    yAxis: { type: 'value', name: 'Points' },
    series: [
      {
        name: 'Points',
        type: 'bar',
        data: driverStandings.slice(0, 10).map((d) => ({ value: d.points, itemStyle: { color: `#${d.teamColor}` } })),
        label: { show: true, position: 'top' },
      },
    ],
  };

  const constructorChartOption = {
    title: {
      text: 'Constructor Championship Points',
      left: 'center',
      textStyle: { fontSize: 18, fontWeight: 'bold' },
    },
    tooltip: { trigger: 'item' },
    legend: { orient: 'vertical', left: 'left', top: 'middle' },
    series: [
      {
        name: 'Points',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
        label: { show: true, formatter: '{b}: {c}' },
        data: constructorStandings.map((c) => ({ value: c.points, name: c.team, itemStyle: { color: `#${c.teamColor}` } })),
      },
    ],
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Tables Section - Side by Side */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Driver Standings */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
              Driver Championship
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Pos</strong></TableCell>
                    <TableCell><strong>Driver</strong></TableCell>
                    <TableCell><strong>Team</strong></TableCell>
                    <TableCell align="right"><strong>Points</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedDrivers.map((row) => (
                    <TableRow key={row.position} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {driverStandings.length > 10 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Button onClick={() => setShowAllDrivers(!showAllDrivers)} endIcon={showAllDrivers ? <ExpandLessIcon /> : <ExpandMoreIcon />} variant="outlined" size="small">
                  {showAllDrivers ? 'Show Less' : `Show All ${driverStandings.length} Drivers`}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        {/* Constructor Standings */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
              Constructor Championship
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Pos</strong></TableCell>
                    <TableCell><strong>Team</strong></TableCell>
                    <TableCell align="right"><strong>Points</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {constructorStandings.map((row) => (
                    <TableRow key={row.position} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 4, height: 24, backgroundColor: `#${row.teamColor}`, borderRadius: 1 }} />
                          {row.position}
                        </Box>
                      </TableCell>
                      <TableCell><strong>{row.team}</strong></TableCell>
                      <TableCell align="right"><strong>{row.points}</strong></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Section - Full Width */}
      <Box sx={{ mt: 4 }}>
        {/* Driver Points Chart */}
        <Box sx={{ 
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw',
          mb: 4
        }}>
          <Paper sx={{ height: 600, p: 2, borderRadius: 0 }}>
            <ReactECharts option={driverChartOption} style={{ height: '100%', width: '100%' }} />
          </Paper>
        </Box>
        
        {/* Constructor Points Chart */}
        <Box sx={{ 
          width: '100vw',
          position: 'relative',
          left: '50%',
          right: '50%',
          marginLeft: '-50vw',
          marginRight: '-50vw'
        }}>
          <Paper sx={{ height: 600, p: 2, borderRadius: 0 }}>
            <ReactECharts option={constructorChartOption} style={{ height: '100%', width: '100%' }} />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default OverallStandings;
