import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

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

interface DriverPointsChartProps {
  standings: DriverStanding[];
}

const DriverPointsChart = ({ standings }: DriverPointsChartProps) => {
  const theme = useTheme();

  const chartOption = {
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
      data: standings.slice(0, 10).map((d) => d.driverAcronym),
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
        data: standings.slice(0, 10).map((d) => ({
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
      <Paper sx={{ height: 600, p: 2, borderRadius: 0 }}>
        <ReactECharts
          option={chartOption}
          style={{ height: "100%", width: "100%" }}
        />
      </Paper>
    </Box>
  );
};

export default DriverPointsChart;
