import { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import {
  Paper,
  Typography,
  useTheme,
  FormControl,
  Select,
  MenuItem,
  Box,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";

interface DriverPosition {
  driverName: string;
  driverAcronym: string;
  teamColor: string;
  positions: (number | null)[];
}

interface DriverRacePositionsChartProps {
  races: string[];
  drivers: DriverPosition[];
}

const DriverRacePositionsChart = ({
  races,
  drivers,
}: DriverRacePositionsChartProps) => {
  const theme = useTheme();
  const [driverLimit, setDriverLimit] = useState<number>(10);

  const handleLimitChange = (event: SelectChangeEvent<number>) => {
    setDriverLimit(event.target.value as number);
  };

  // Filter to show selected number of drivers (by best average finishing position)
  // Memoize to prevent unnecessary recalculations
  const topDrivers = useMemo(() => {
    return [...drivers]
      .map((d) => {
        const validPositions = d.positions.filter(
          (p): p is number => p !== null && p !== 21
        );
        const avgPosition =
          validPositions.length > 0
            ? validPositions.reduce((sum, p) => sum + p, 0) /
              validPositions.length
            : 999; // Put drivers with no finishes at the end
        return {
          ...d,
          validRaces: d.positions.filter((p) => p !== null).length,
          avgPosition,
        };
      })
      .sort((a, b) => a.avgPosition - b.avgPosition) // Lower average position is better
      .slice(0, driverLimit === -1 ? drivers.length : driverLimit);
  }, [drivers, driverLimit]);

  const chartOption = useMemo(
    () => ({
      title: {
        text: "Driver Race Positions - Season Trend",
        left: "center",
        textStyle: { color: theme.palette.text.primary },
      },
      tooltip: {
        trigger: "axis",
        backgroundColor: theme.palette.background.paper,
        textStyle: { color: theme.palette.text.primary },
        formatter: (params: any) => {
          const raceIndex = params[0].dataIndex;
          let tooltip = `<strong>${races[raceIndex]}</strong><br/>`;
          params.forEach((param: any) => {
            const position = param.value;
            if (position === 21) {
              tooltip += `${param.marker}${param.seriesName}: DNF<br/>`;
            } else if (position !== null) {
              tooltip += `${param.marker}${param.seriesName}: P${position}<br/>`;
            }
          });
          return tooltip;
        },
      },
      legend: {
        top: 30,
        textStyle: { color: theme.palette.text.primary },
        type: "scroll",
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "10%",
        top: "15%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: races,
        axisLabel: {
          rotate: 45,
          interval: 0,
          color: theme.palette.text.secondary,
          fontSize: 10,
        },
        axisLine: {
          lineStyle: { color: theme.palette.divider },
        },
      },
      yAxis: {
        type: "value",
        name: "Position",
        inverse: true, // Lower position numbers at top
        min: 1,
        max: 21, // Extended to include DNF marker
        interval: 1,
        nameTextStyle: { color: theme.palette.text.secondary },
        axisLabel: {
          color: theme.palette.text.secondary,
          formatter: (value: number) => {
            if (value === 21) return "DNF";
            return `P${value}`;
          },
        },
        axisLine: {
          lineStyle: { color: theme.palette.divider },
        },
        splitLine: {
          lineStyle: { color: theme.palette.divider, opacity: 0.2 },
        },
      },
      series: topDrivers.map((driver) => ({
        name: driver.driverAcronym,
        type: "line",
        data: driver.positions.map((p) => (p === null ? 21 : p)), // Show DNF at position 21
        connectNulls: true, // Connect lines through DNF positions
        emphasis: {
          focus: "series",
        },
        lineStyle: {
          width: 2,
          color: `#${driver.teamColor}`,
        },
        itemStyle: {
          color: `#${driver.teamColor}`,
        },
        symbol: "circle",
        symbolSize: 6,
      })),
    }),
    [races, theme.palette, topDrivers]
  );

  return (
    <Paper
      sx={{
        width: "100vw",
        position: "relative",
        left: "50%",
        right: "50%",
        marginLeft: "-50vw",
        marginRight: "-50vw",
        mt: 4,
        p: 2,
        borderRadius: 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {driverLimit === -1 ? "all" : `top ${driverLimit}`} drivers by
          average position
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={driverLimit}
            onChange={handleLimitChange}
            sx={{
              color: "text.secondary",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "divider",
              },
            }}
          >
            <MenuItem value={5}>5 Drivers</MenuItem>
            <MenuItem value={10}>10 Drivers</MenuItem>
            <MenuItem value={15}>15 Drivers</MenuItem>
            <MenuItem value={20}>20 Drivers</MenuItem>
            <MenuItem value={-1}>All Drivers</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <ReactECharts
        option={chartOption}
        notMerge={true}
        lazyUpdate={true}
        style={{ height: "600px", width: "100%" }}
      />
    </Paper>
  );
};

export default DriverRacePositionsChart;
