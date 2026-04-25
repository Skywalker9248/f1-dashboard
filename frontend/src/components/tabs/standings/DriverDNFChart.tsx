import { memo, useMemo } from "react";
import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { TOP_STANDINGS_COUNT, CHART_HEIGHT } from "../../../constants";
import type { DriverStat } from "../../../types/f1";
import WidgetWrapper from "../../WidgetWrapper";

interface DriverDNFChartProps {
  stats: DriverStat[];
  loading?: boolean;
  onRefresh?: () => void;
}

const DriverDNFChart = memo(({ stats, loading, onRefresh }: DriverDNFChartProps) => {
  const theme = useTheme();

  const sortedStats = useMemo(
    () =>
      [...stats]
        .sort((a, b) => b.dnfCount - a.dnfCount)
        .slice(0, TOP_STANDINGS_COUNT),
    [stats]
  );

  const chartOption = useMemo(
    () => ({
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
        formatter: (params: { dataIndex: number }[]) => {
          const stat = sortedStats[params[0].dataIndex];
          return `${stat.driver}<br/>DNFs: ${stat.dnfCount}<br/>Team: ${stat.team}`;
        },
      },
      grid: { left: "1%", right: "1%", bottom: "15%", top: "15%", containLabel: true },
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
        minInterval: 1,
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
    }),
    [sortedStats, theme.palette]
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
        mt: 4,
        mb: 4,
      }}
    >
      <WidgetWrapper loading={loading ?? false} onRefresh={onRefresh} minHeight={CHART_HEIGHT}>
        <Paper sx={{ height: CHART_HEIGHT, p: 2, borderRadius: 0 }}>
          <ReactECharts
            option={chartOption}
            style={{ height: "100%", width: "100%" }}
          />
        </Paper>
      </WidgetWrapper>
    </Box>
  );
});

DriverDNFChart.displayName = "DriverDNFChart";

export default DriverDNFChart;
