import { type JSX } from "react";
import { Typography, Paper, Box, Divider, useTheme } from "@mui/material";

interface WeatherForecast {
  tempMax: number;
  tempMin: number;
  precipProb: number;
  weatherCode: number;
}

interface WeatherWidgetProps {
  weather: WeatherForecast;
  weatherInfo: {
    label: string;
    icon: JSX.Element;
  };
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  weather,
  weatherInfo,
}) => {
  const theme = useTheme();

  return (
    <Paper sx={{ p: 0, height: "100%" }}>
      <Box
        sx={{
          p: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "#f5f5f5",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight="bold">
          Race Forecast
        </Typography>
      </Box>
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {/* Weather Icon */}
        <Box sx={{ transform: "scale(1.5)", my: 1 }}>{weatherInfo.icon}</Box>
        <Typography variant="h5" fontWeight="medium">
          {weatherInfo.label}
        </Typography>

        <Divider flexItem />

        {/* Stats */}
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            px: 1,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              High
            </Typography>
            <Typography variant="h6">{weather.tempMax}°C</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Low
            </Typography>
            <Typography variant="h6">{weather.tempMin}°C</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Rain
            </Typography>
            <Typography variant="h6">{weather.precipProb}%</Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default WeatherWidget;
