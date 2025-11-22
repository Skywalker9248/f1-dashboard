import { useState } from "react";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

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

interface DriverStandingsTableProps {
  standings: DriverStanding[];
}

const DriverStandingsTable = ({ standings }: DriverStandingsTableProps) => {
  const [showAllDrivers, setShowAllDrivers] = useState(false);

  const displayedDrivers = showAllDrivers ? standings : standings.slice(0, 10);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
        Driver Championship
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Pos</strong>
              </TableCell>
              <TableCell>
                <strong>Driver</strong>
              </TableCell>
              <TableCell>
                <strong>Team</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Points</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedDrivers.map((row) => (
              <TableRow
                key={row.position}
                sx={{ "&:hover": { backgroundColor: "action.hover" } }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: 4,
                        height: 24,
                        backgroundColor: `#${row.teamColor}`,
                        borderRadius: 1,
                      }}
                    />
                    {row.position}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                      {row.driver}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      #{row.driverNumber} • {row.driverAcronym}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{row.team}</TableCell>
                <TableCell align="right">
                  <strong>{row.points}</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {standings.length > 10 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Button
            onClick={() => setShowAllDrivers(!showAllDrivers)}
            endIcon={showAllDrivers ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            variant="outlined"
            size="small"
          >
            {showAllDrivers
              ? "Show Less"
              : `Show All ${standings.length} Drivers`}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default DriverStandingsTable;
