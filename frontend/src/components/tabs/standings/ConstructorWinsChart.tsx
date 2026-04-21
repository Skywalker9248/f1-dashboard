import { memo, useMemo } from "react";
import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { CHART_HEIGHT } from "../../../constants";
import type { ConstructorWin } from "../../../types/f1";
import WidgetWrapper from "../../WidgetWrapper";

interface ConstructorWinsChartProps {
  wins: ConstructorWin[];
  loading?: boolean;
  onRefresh?: () => void;
}

const ConstructorWinsChart = memo(({ wins, loading, onRefresh }: ConstructorWinsChartProps) => {
  const theme = useTheme();

  const chartOption = useMemo(
    () => ({
      title: {
        text: "Constructor Wins",
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
        formatter: "{b}: {c} wins ({d}%)",
      },
      legend: {
        bottom: "0",
        left: "center",
        textStyle: { color: theme.palette.text.secondary },
      },
      series: [
        {
          name: "Wins",
          type: "pie",
          radius: ["40%", "70%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: theme.palette.background.default,
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: "{b}\n{c} wins",
            color: theme.palette.text.primary,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: "bold",
            },
          },
          data: wins.map((w) => ({
            value: w.wins,
            name: w.team,
            itemStyle: { color: `#${w.teamColor}` },
          })),
        },
      ],
    }),
    [wins, theme.palette]
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

ConstructorWinsChart.displayName = "ConstructorWinsChart";

export default ConstructorWinsChart;
