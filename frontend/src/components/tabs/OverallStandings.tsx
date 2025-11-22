import { useEffect, useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  Box,
  Grid,
  Button,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ReactECharts from "echarts-for-react";
import API from "../../axios";
import LoadingUI from "../LoadingUI";

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
  const [constructorStandings, setConstructorStandings] = useState<
    ConstructorStanding[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get("/api/f1/standings/drivers"),
      API.get("/api/f1/standings/constructors"),
    ])
      .then(([driversResponse, constructorsResponse]) => {
        // Handle new response format with season info
        const drivers = driversResponse.data.standings || driversResponse.data;
        const constructors =
          constructorsResponse.data.standings || constructorsResponse.data;
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

  if (loading) return <LoadingUI />;
  if (error) return <Alert severity="error">{error}</Alert>;

  const displayedDrivers = showAllDrivers
    ? driverStandings
    : driverStandings.slice(0, 10);

  const theme = useTheme();

  const driverChartOption = {
    title: {
      text: "Driver Championship Points",
      left: "center",
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.palette.text.primary,
      },
    },
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      backgroundColor: theme.palette.background.paper,
      textStyle: { color: theme.palette.text.primary },
    },
    grid: { left: "1%", right: "1%", bottom: "15%", containLabel: true },
    xAxis: {
      type: "category",
      data: driverStandings.slice(0, 10).map((d) => d.driverAcronym),
      axisLabel: {
        rotate: 45,
        interval: 0,
        color: theme.palette.text.secondary,
      },
    },
    yAxis: {
      type: "value",
      name: "Points",
      nameTextStyle: { color: theme.palette.text.secondary },
      axisLabel: { color: theme.palette.text.secondary },
    },
    series: [
      {
        name: "Points",
        type: "bar",
        data: driverStandings.slice(0, 10).map((d) => ({
          value: d.points,
          itemStyle: { color: `#${d.teamColor}` },
        })),
        label: {
          show: true,
          position: "top",
          color: theme.palette.text.primary,
        },
      },
    ],
  };

  const constructorChartOption = {
    title: {
      text: "Constructor Championship Points",
      left: "center",
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: theme.palette.text.primary,
      },
    },
    tooltip: {
      trigger: "item",
      backgroundColor: theme.palette.background.paper,
      textStyle: { color: theme.palette.text.primary },
    },
    legend: {
      orient: "vertical",
      left: "left",
      top: "middle",
      textStyle: { color: theme.palette.text.secondary },
    },
    series: [
      {
        name: "Points",
        type: "pie",
        radius: ["40%", "70%"],
        center: ["60%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: theme.palette.background.paper,
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: "{b}: {c}",
          color: theme.palette.text.primary,
        },
        data: constructorStandings.map((c) => ({
          value: c.points,
          name: c.team,
          itemStyle: { color: `#${c.teamColor}` },
        })),
      },
    ],
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Tables Section - Side by Side */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* Driver Standings */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Driver Championship
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Pos</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Driver</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Team</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Points</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayedDrivers.map((row) => (
                    <TableRow
                      key={row.position}
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 4,
                              height: 24,
                              backgroundColor: `#${row.teamColor}`,
                              borderRadius: 1,
                            }}
                          />
                          {row.position}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: "bold" }}
                          >
                            {row.driver}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{row.driverNumber} • {row.driverAcronym}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{row.team}</TableCell>
                      <TableCell align="right">
                        <strong>{row.points}</strong>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {driverStandings.length > 10 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Button
                  onClick={() => setShowAllDrivers(!showAllDrivers)}
                  endIcon={
                    showAllDrivers ? <ExpandLessIcon /> : <ExpandMoreIcon />
                  }
                  variant="outlined"
                  size="small"
                >
                  {showAllDrivers
                    ? "Show Less"
                    : `Show All ${driverStandings.length} Drivers`}
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
        {/* Constructor Standings */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3 }}>
            <Typography
              variant="h6"
              color="primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
              Constructor Championship
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Pos</strong>
                    </TableCell>
                    <TableCell>
                      <strong>Team</strong>
                    </TableCell>
                    <TableCell align="right">
                      <strong>Points</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {constructorStandings.map((row) => (
                    <TableRow
                      key={row.position}
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 4,
                              height: 24,
                              backgroundColor: `#${row.teamColor}`,
                              borderRadius: 1,
                            }}
                          />
                          {row.position}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <strong>{row.team}</strong>
                      </TableCell>
                      <TableCell align="right">
                        <strong>{row.points}</strong>
                      </TableCell>
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
        <Box
          sx={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
            mb: 4,
          }}
        >
          <Paper sx={{ height: 600, p: 2, borderRadius: 0 }}>
            <ReactECharts
              option={driverChartOption}
              style={{ height: "100%", width: "100%" }}
            />
          </Paper>
        </Box>

        {/* Constructor Points Chart */}
        <Box
          sx={{
            width: "100vw",
            position: "relative",
            left: "50%",
            right: "50%",
            marginLeft: "-50vw",
            marginRight: "-50vw",
          }}
        >
          <Paper sx={{ height: 600, p: 2, borderRadius: 0 }}>
            <ReactECharts
              option={constructorChartOption}
              style={{ height: "100%", width: "100%" }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default OverallStandings;
