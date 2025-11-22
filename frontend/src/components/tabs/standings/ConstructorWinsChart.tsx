import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

interface ConstructorWin {
  team: string;
  teamColor: string;
  wins: number;
}

interface ConstructorWinsChartProps {
  wins: ConstructorWin[];
}

const ConstructorWinsChart = ({ wins }: ConstructorWinsChartProps) => {
  const theme = useTheme();

  const chartOption = {
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

export default ConstructorWinsChart;
