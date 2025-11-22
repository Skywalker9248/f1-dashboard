import { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  CircularProgress,
  Alert,
  Box,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import FlagIcon from "@mui/icons-material/Flag";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import CloudIcon from "@mui/icons-material/Cloud";
import GrainIcon from "@mui/icons-material/Grain";
import ThunderstormIcon from "@mui/icons-material/Thunderstorm";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import API from "../../axios"; // Ensure this path matches your project
import ScheduleWidget from "../widgets/ScheduleWidget";
import WeatherWidget from "../widgets/WeatherWidget";

// --- Types ---
// These interfaces match the ones in the widgets.
// Ideally, these should be in a shared types file.
interface Session {
  sessionName: string;
  sessionType: string;
  dateStart: string;
  dateEnd: string;
}

interface WeatherForecast {
  tempMax: number;
  tempMin: number;
  precipProb: number;
  weatherCode: number;
}

interface NextRaceData {
  circuit?: string;
  location?: string;
  country?: string;
  raceDate?: string;
  meetingKey?: number;
  sessions?: Session[];
  weather?: WeatherForecast | null;
  message?: string;
  nextSeason?: number;
}

// --- Helper: Weather Icon Mapper ---
const getWeatherDetails = (code: number) => {
  // WMO Weather interpretation codes (http://www.nodc.noaa.gov/archive/arc0021/0002199/1.1/data/0-data/HTML/WMO-CODE/WMO4677.HTM)
  if (code === 0)
    return {
      label: "Clear Sky",
      icon: <WbSunnyIcon sx={{ color: "#FFD700" }} />,
    };
  if (code >= 1 && code <= 3)
    return { label: "Cloudy", icon: <CloudIcon sx={{ color: "#90A4AE" }} /> };
  if (code >= 51 && code <= 67)
    return { label: "Rain", icon: <WaterDropIcon sx={{ color: "#4FC3F7" }} /> };
  if (code >= 71 && code <= 77)
    return { label: "Snow", icon: <GrainIcon sx={{ color: "#E0E0E0" }} /> };
  if (code >= 95)
    return {
      label: "Storm",
      icon: <ThunderstormIcon sx={{ color: "#FFEB3B" }} />,
    };
  return { label: "Overcast", icon: <CloudIcon /> };
};

const NextRace = () => {
  const [data, setData] = useState<NextRaceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    API.get("/api/f1/next-race")
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load race data");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="warning">No data available</Alert>;

  if (data.message) {
    return (
      <Box sx={{ textAlign: "center", p: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          {data.message}
        </Alert>
        {data.nextSeason && (
          <Typography>See you in {data.nextSeason}!</Typography>
        )}
      </Box>
    );
  }

  const calculateCountdown = (dateString: string) => {
    const now = new Date();
    const raceDate = new Date(dateString);
    const diff = raceDate.getTime() - now.getTime();
    if (diff < 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  };

  const countdown = data.raceDate ? calculateCountdown(data.raceDate) : null;
  const weatherInfo = data.weather
    ? getWeatherDetails(data.weather.weatherCode)
    : null;

  return (
    <Box sx={{ py: 2 }}>
      {/* 1. HERO HEADER */}
      <Paper
        sx={{
          p: 4,
          mb: 3,
          background: "linear-gradient(135deg, #cc0000 0%, #800000 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid size={{ xs: 12, md: 8 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1,
                opacity: 0.9,
              }}
            >
              <FlagIcon fontSize="small" />
              <Typography
                variant="overline"
                sx={{ fontWeight: "bold", letterSpacing: 1 }}
              >
                ROUND {data.meetingKey}
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{ fontWeight: "800", mb: 2, textTransform: "uppercase" }}
            >
              {data.circuit}
            </Typography>
            <Box
              sx={{ display: "flex", gap: 3, flexWrap: "wrap", opacity: 0.9 }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOnIcon fontSize="small" />
                <Typography variant="subtitle1">
                  {data.location}, {data.country}
                </Typography>
              </Box>
              {data.raceDate && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CalendarTodayIcon fontSize="small" />
                  <Typography variant="subtitle1">
                    {new Date(data.raceDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>

          {/* Countdown Card */}
          {countdown && (
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  bgcolor: "rgba(0,0,0,0.3)",
                  color: "white",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <CardContent sx={{ textAlign: "center", py: 2 }}>
                  <Typography
                    variant="caption"
                    sx={{ textTransform: "uppercase", opacity: 0.8 }}
                  >
                    Lights Out In
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "baseline",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h3" fontWeight="bold">
                      {countdown.days}
                    </Typography>
                    <Typography variant="body2">days</Typography>
                    <Typography variant="h3" fontWeight="bold">
                      {countdown.hours}
                    </Typography>
                    <Typography variant="body2">hrs</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* 2. SCHEDULE TABLE */}
        <Grid size={{ xs: 12, md: data.weather ? 6 : 12 }}>
          {data.sessions && <ScheduleWidget sessions={data.sessions} />}
        </Grid>

        {/* 3. WEATHER CARD */}
        {data.weather && weatherInfo && (
          <Grid size={{ xs: 12, md: 6 }}>
            <WeatherWidget weather={data.weather} weatherInfo={weatherInfo} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default NextRace;
