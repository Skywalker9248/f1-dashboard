import { memo, useMemo } from "react";
import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";
import { CHART_HEIGHT } from "../../../constants";
import type { ConstructorStanding } from "../../../types/f1";

interface ConstructorPointsChartProps {
  standings: ConstructorStanding[];
}

const ConstructorPointsChart = memo(
  ({ standings }: ConstructorPointsChartProps) => {
    const theme = useTheme();

    const chartOption = useMemo(
      () => ({
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
            data: standings.map((c) => ({
              value: c.points,
              name: c.team,
              itemStyle: { color: `#${c.teamColor}` },
            })),
          },
        ],
      }),
      [standings, theme.palette]
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
  }
);

ConstructorPointsChart.displayName = "ConstructorPointsChart";

export default ConstructorPointsChart;
