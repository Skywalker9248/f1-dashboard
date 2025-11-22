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
} from "@mui/material";

interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
}

interface ConstructorStandingsTableProps {
  standings: ConstructorStanding[];
}

const ConstructorStandingsTable = ({
  standings,
}: ConstructorStandingsTableProps) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 2 }}>
        Constructor Championship
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Pos</strong>
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
            {standings.map((row) => (
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
                  <strong>{row.team}</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>{row.points}</strong>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default ConstructorStandingsTable;
