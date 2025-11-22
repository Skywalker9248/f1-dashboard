import {
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
  useTheme,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface Session {
  sessionName: string;
  sessionType: string;
  dateStart: string;
  dateEnd: string;
}

interface ScheduleWidgetProps {
  sessions: Session[];
}

const ScheduleWidget: React.FC<ScheduleWidgetProps> = ({ sessions }) => {
  const theme = useTheme();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  return (
    <Paper sx={{ p: 0, overflow: "hidden", height: "100%" }}>
      <Box
        sx={{
          p: 2,
          bgcolor:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.05)"
              : "#f5f5f5",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" fontWeight="bold" color="text.primary">
          Weekend Schedule
        </Typography>
      </Box>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Session</TableCell>
              <TableCell>Time</TableCell>
              <TableCell align="right">Duration</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session, index) => {
              const { date, time } = formatDateTime(session.dateStart);
              const duration = Math.round(
                (new Date(session.dateEnd).getTime() -
                  new Date(session.dateStart).getTime()) /
                  60000
              );
              const isRace = session.sessionName === "Race";

              return (
                <TableRow
                  key={index}
                  sx={{
                    bgcolor: isRace
                      ? theme.palette.mode === "dark"
                        ? "rgba(255, 0, 0, 0.1)"
                        : "rgba(255, 0, 0, 0.04)"
                      : "inherit",
                  }}
                >
                  <TableCell>
                    <Typography
                      variant="body2"
                      fontWeight={isRace ? "bold" : "medium"}
                    >
                      {session.sessionName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {date}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={
                        <AccessTimeIcon sx={{ fontSize: "1rem !important" }} />
                      }
                      label={time}
                      size="small"
                      variant="outlined"
                      sx={{
                        borderColor: isRace ? "#d32f2f" : "divider",
                        color: isRace ? "#d32f2f" : "text.primary",
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="text.secondary">
                      {duration} min
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ScheduleWidget;
