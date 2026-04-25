import { memo, useMemo } from "react";
import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { TOP_STANDINGS_COUNT, CHART_HEIGHT } from "../../../constants";
import type { DriverStat } from "../../../types/f1";
import WidgetWrapper from "../../WidgetWrapper";

interface DriverGridPositionChartProps {
  stats: DriverStat[];
  loading?: boolean;
  onRefresh?: () => void;
}

const DriverGridPositionChart = memo(
  ({ stats, loading, onRefresh }: DriverGridPositionChartProps) => {
    const theme = useTheme();

    const sortedStats = useMemo(
      () =>
        [...stats]
          .filter((d) => d.averageGridPosition !== null)
          .sort(
            (a, b) =>
              (a.averageGridPosition || 21) - (b.averageGridPosition || 21)
          )
          .slice(0, TOP_STANDINGS_COUNT),
      [stats]
    );

    const chartOption = useMemo(
      () => ({
        title: {
          text: "Average Starting Grid Position",
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
            return `${stat.driver}<br/>Avg Grid: ${stat.averageGridPosition?.toFixed(2)}<br/>Team: ${stat.team}`;
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
          name: "Grid Position",
          min: 0,
          nameTextStyle: { color: theme.palette.text.secondary },
          axisLabel: {
            color: theme.palette.text.secondary,
            formatter: (value: number) => (value === 0 ? "" : `P${value}`),
          },
          splitLine: {
            lineStyle: { color: theme.palette.divider, opacity: 0.3 },
          },
        },
        series: [
          {
            name: "Avg Grid Position",
            type: "bar",
            data: sortedStats.map((d) => ({
              value: d.averageGridPosition,
              itemStyle: { color: `#${d.teamColor}` },
            })),
            label: {
              show: true,
              position: "top",
              color: theme.palette.text.primary,
              formatter: (params: { value: number }) =>
                params.value.toFixed(1),
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
  }
);

DriverGridPositionChart.displayName = "DriverGridPositionChart";

export default DriverGridPositionChart;
