import { memo, useMemo } from "react";
import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { TOP_STANDINGS_COUNT, CHART_HEIGHT } from "../../../constants";
import type { DriverStanding } from "../../../types/f1";

interface DriverPointsChartProps {
  standings: DriverStanding[];
}

const DriverPointsChart = memo(({ standings }: DriverPointsChartProps) => {
  const theme = useTheme();

  const topStandings = useMemo(
    () => standings.slice(0, TOP_STANDINGS_COUNT),
    [standings]
  );

  const chartOption = useMemo(
    () => ({
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
        formatter: (params: { dataIndex: number }[]) => {
          const d = topStandings[params[0].dataIndex];
          return `${d.driver}<br/>Points: ${d.points}<br/>Team: ${d.team}`;
        },
      },
      grid: { left: "1%", right: "1%", bottom: "15%", containLabel: true },
      xAxis: {
        type: "category",
        data: topStandings.map((d) => d.driverAcronym),
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
          data: topStandings.map((d) => ({
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
    }),
    [topStandings, theme.palette]
  );

  return (
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
      <Paper sx={{ height: CHART_HEIGHT, p: 2, borderRadius: 0 }}>
        <ReactECharts
          option={chartOption}
          style={{ height: "100%", width: "100%" }}
        />
      </Paper>
    </Box>
  );
});

DriverPointsChart.displayName = "DriverPointsChart";

export default DriverPointsChart;
