import React, { useEffect, useState } from 'react';
import {
  Typography,
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
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import FlagIcon from '@mui/icons-material/Flag';
import API from '../../axios';

interface Session {
  sessionName: string;
  sessionType: string;
  dateStart: string;
  dateEnd: string;
}

interface NextRaceData {
  circuit?: string;
  location?: string;
  country?: string;
  raceDate?: string;
  meetingKey?: number;
  sessions?: Session[];
  message?: string;
  nextSeason?: number;
}

const NextRace = () => {
  const [data, setData] = useState<NextRaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get('/api/f1/next-race')
      .then(response => {
        setData(response.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="warning">No data available</Alert>;

  if (data.message) {
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {data.message}
        </Alert>
        {data.nextSeason && (
          <Typography variant="body1" color="text.secondary">
            Check back for the {data.nextSeason} season!
          </Typography>
        )}
      </Box>
    );
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      })
    };
  };

  const calculateCountdown = (dateString: string) => {
    const now = new Date();
    const raceDate = new Date(dateString);
    const diff = raceDate.getTime() - now.getTime();
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return { days, hours };
  };

  const countdown = data.raceDate ? calculateCountdown(data.raceDate) : null;

  return (
    <Box sx={{ py: 2 }}>
      {/* Race Header */}
      <Paper sx={{ p: 4, mb: 4, background: 'linear-gradient(135deg, #E10600 0%, #8B0000 100%)', color: 'white' }}>
        <Grid container spacing={3} alignItems="center">
          <Grid xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <FlagIcon />
              <Typography variant="overline" sx={{ fontSize: '0.875rem' }}>Next Race</Typography>
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 2 }}>
              {data.circuit}
            </Typography>
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOnIcon />
                <Typography variant="h6">{data.location}, {data.country}</Typography>
              </Box>
              {data.raceDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarTodayIcon />
                  <Typography variant="h6">
                    {formatDateTime(data.raceDate).date}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
          {countdown && (
            <Grid xs={12} md={4}>
              <Card sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="overline" sx={{ color: 'white', opacity: 0.8, fontSize: '0.875rem' }}>
                    Countdown
                  </Typography>
                  <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'white', my: 1 }}>
                    {countdown.days}
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'white', opacity: 0.9 }}>
                    days, {countdown.hours} hours
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Schedule */}
      {data.sessions && data.sessions.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
            Race Weekend Schedule
          </Typography>
          <Divider sx={{ mb: 3 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Session</strong></TableCell>
                  <TableCell><strong>Type</strong></TableCell>
                  <TableCell><strong>Date & Time</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.sessions.map((session, index) => {
                  const start = formatDateTime(session.dateStart);
                  const end = new Date(session.dateEnd);
                  const startDate = new Date(session.dateStart);
                  const durationMinutes = Math.round((end.getTime() - startDate.getTime()) / (1000 * 60));
                  
                  return (
                    <TableRow key={index} sx={{ '&:hover': { backgroundColor: 'action.hover' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {session.sessionName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {session.sessionType}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {start.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {start.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {durationMinutes} minutes
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}
    </Box>
  );
};

export default NextRace;
