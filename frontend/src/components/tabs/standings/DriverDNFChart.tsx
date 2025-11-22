import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

interface DriverStat {
  driver: string;
  driverAcronym: string;
  team: string;
  teamColor: string;
  dnfCount: number;
  totalRaces: number;
}

interface DriverDNFChartProps {
  stats: DriverStat[];
}

const DriverDNFChart = ({ stats }: DriverDNFChartProps) => {
  const theme = useTheme();

  // Sort by DNF count descending and show top 10
  const sortedStats = [...stats]
    .sort((a, b) => b.dnfCount - a.dnfCount)
    .slice(0, 10);

  const chartOption = {
    title: {
      text: "DNF Count by Driver",
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
      formatter: (params: any) => {
        const dataIndex = params[0].dataIndex;
        const stat = sortedStats[dataIndex];
        return `${stat.driver}<br/>DNFs: ${stat.dnfCount}<br/>Team: ${stat.team}`;
      },
    },
    grid: { left: "1%", right: "1%", bottom: "15%", containLabel: true },
    xAxis: {
      type: "category",
      data: sortedStats.map((d) => d.driverAcronym),
      axisLabel: {
        rotate: 45,
        interval: 0,
        color: theme.palette.text.secondary,
      },
    },
    yAxis: {
      type: "value",
      name: "DNF Count",
      nameTextStyle: { color: theme.palette.text.secondary },
      axisLabel: { color: theme.palette.text.secondary },
    },
    series: [
      {
        name: "DNF Count",
        type: "bar",
        data: sortedStats.map((d) => ({
          value: d.dnfCount,
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

export default DriverDNFChart;
