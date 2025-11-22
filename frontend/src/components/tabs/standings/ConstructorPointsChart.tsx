import { Paper, Box, useTheme } from "@mui/material";
import ReactECharts from "echarts-for-react";

interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
}

interface ConstructorPointsChartProps {
  standings: ConstructorStanding[];
}

const ConstructorPointsChart = ({ standings }: ConstructorPointsChartProps) => {
  const theme = useTheme();

  const chartOption = {
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

export default ConstructorPointsChart;
