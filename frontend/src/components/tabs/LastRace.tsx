import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
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
  Alert,
  Box,
  Chip,
  useTheme,
} from "@mui/material";
import WidgetWrapper from "../WidgetWrapper";
import useDataFetch from "../../hooks/useDataFetch";
import { CHART_HEIGHT } from "../../constants";

interface SessionInfo {
  circuit: string;
  location: string;
  country: string;
  date: string;
  sessionName: string;
  sessionType: string;
}

interface Standing {
  position: number | null;
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
  gapToLeader: number | string;
  numberOfLaps: number;
  fastestLapTime: number | null;
}

interface LastRaceData {
  sessionInfo: SessionInfo;
  standings: Standing[];
}

// Pure functions — no dependency on props/state, safe at module level
function formatLapTime(seconds: number | null): string {
  if (!seconds) return "N/A";
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(3);
  return `${mins}:${secs.padStart(6, "0")}`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

const LastRace = () => {
  const { data, loading, error, retry } = useDataFetch<LastRaceData>("/api/f1/last-race");
  const theme = useTheme();

  // All hooks must run unconditionally before any conditional rendering
  const sortedStandings = useMemo(() => {
    if (!data) return [];
    return [...data.standings].sort((a, b) => {
      const aDidNotFinish = a.dnf || a.dns || a.dsq;
      const bDidNotFinish = b.dnf || b.dns || b.dsq;
      if (!aDidNotFinish && bDidNotFinish) return -1;
      if (aDidNotFinish && !bDidNotFinish) return 1;
      if (a.position === null && b.position === null) return 0;
      if (a.position === null) return 1;
      if (b.position === null) return -1;
      return a.position - b.position;
    });
  }, [data]);

  const driversWithLaps = useMemo(
    () =>
      [...sortedStandings]
        .filter((d) => d.fastestLapTime)
        .sort((a, b) => (a.fastestLapTime || 999) - (b.fastestLapTime || 999)),
    [sortedStandings]
  );

  const chartOption = useMemo(
    () => ({
      title: {
        text: "Fastest Lap Times",
        left: "center",
        textStyle: { color: theme.palette.text.primary },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
        backgroundColor: theme.palette.background.paper,
        textStyle: { color: theme.palette.text.primary },
        formatter: (params: { dataIndex: number }[]) => {
          const driver = driversWithLaps[params[0].dataIndex];
          return `${driver.driver}<br/>Fastest Lap: ${formatLapTime(
            driver.fastestLapTime
          )}<br/>Team: ${driver.team}`;
        },
      },
      xAxis: {
        type: "category",
        data: driversWithLaps.map((d) => d.driverAcronym),
        axisLabel: {
          rotate: 45,
          interval: 0,
          color: theme.palette.text.secondary,
        },
      },
      yAxis: {
        type: "value",
        name: "Lap Time (seconds)",
        nameTextStyle: { color: theme.palette.text.secondary },
        axisLabel: {
          color: theme.palette.text.secondary,
          formatter: (value: number) => formatLapTime(value),
        },
      },
      series: [
        {
          name: "Fastest Lap",
          type: "bar",
          data: driversWithLaps.map((d) => ({
            value: d.fastestLapTime,
            itemStyle: { color: `#${d.teamColor || "1976d2"}` },
          })),
          label: {
            show: true,
            position: "top",
            color: theme.palette.text.primary,
            formatter: (params: { value: number }) =>
              formatLapTime(params.value),
          },
        },
      ],
    }),
    [driversWithLaps, theme.palette]
  );

  return (
    <Box sx={{ py: 2 }}>
      {/* Session Information */}
      <WidgetWrapper loading={loading} error={error} onRefresh={retry} minHeight={130}>
        {data && (
          <Paper sx={{ p: 3, mb: 4, backgroundColor: "background.default" }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                  {data.sessionInfo.sessionName}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {data.sessionInfo.circuit} - {data.sessionInfo.country}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }} sx={{ textAlign: { md: "right" } }}>
                <Typography variant="h6">{formatDate(data.sessionInfo.date)}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {data.sessionInfo.location}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </WidgetWrapper>

      {/* Results Table */}
      <WidgetWrapper loading={loading} error={error} onRefresh={retry} minHeight={400}>
        {data && (
          <Paper sx={{ p: 3, display: "flex", flexDirection: "column" }}>
            <Typography
              component="h2"
              variant="h6"
              color="primary"
              gutterBottom
              sx={{ mb: 2 }}
            >
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
                  {sortedStandings.map((row) => (
                    <TableRow
                      key={row.driverNumber}
                      sx={{ "&:hover": { backgroundColor: "action.hover" } }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 4,
                              height: 24,
                              backgroundColor: `#${row.teamColor}`,
                              borderRadius: 1,
                            }}
                          />
                          {row.position ?? "-"}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
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
                      <TableCell align="right">
                        {row.position === 1
                          ? "-"
                          : typeof row.gapToLeader === "string"
                          ? row.gapToLeader
                          : `+${(row.gapToLeader || 0).toFixed(3)}s`}
                      </TableCell>
                      <TableCell align="center">
                        {row.dnf && <Chip label="DNF" size="small" color="error" />}
                        {row.dns && <Chip label="DNS" size="small" color="warning" />}
                        {row.dsq && <Chip label="DSQ" size="small" color="error" />}
                        {!row.dnf && !row.dns && !row.dsq && (
                          <Chip label="Finished" size="small" color="success" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
        {!loading && !error && !data && (
          <Alert severity="warning">No race data available.</Alert>
        )}
      </WidgetWrapper>

      {/* Fastest Lap Chart - Full Width */}
      <Box
        sx={{
          width: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          mt: 4,
        }}
      >
        <WidgetWrapper loading={loading} error={error} onRefresh={retry} minHeight={CHART_HEIGHT}>
          {data && (
            <Paper sx={{ height: CHART_HEIGHT, p: 2, borderRadius: 0 }}>
              <ReactECharts
                option={chartOption}
                style={{ height: "100%", width: "100%" }}
              />
            </Paper>
          )}
        </WidgetWrapper>
      </Box>
    </Box>
  );
};

export default LastRace;
