import ReactECharts from "echarts-for-react";
import { Paper, Typography, useTheme } from "@mui/material";

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

  // Filter to show only top 10 drivers in championship (those with most non-null positions)
  const topDrivers = [...drivers]
    .map((d) => ({
      ...d,
      validRaces: d.positions.filter((p) => p !== null).length,
    }))
    .sort((a, b) => b.validRaces - a.validRaces)
    .slice(0, 10);

  const chartOption = {
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
  };

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
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 2, textAlign: "center" }}
      >
        Showing top 10 drivers by race participation
      </Typography>
      <ReactECharts
        option={chartOption}
        style={{ height: "600px", width: "100%" }}
      />
    </Paper>
  );
};

export default DriverRacePositionsChart;
