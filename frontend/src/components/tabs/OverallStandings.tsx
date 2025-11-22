import { useEffect, useState } from "react";
import { Alert, Box, Grid } from "@mui/material";
import API from "../../axios";
import LoadingUI from "../LoadingUI";
import DriverStandingsTable from "./standings/DriverStandingsTable";
import ConstructorStandingsTable from "./standings/ConstructorStandingsTable";
import DriverDNFChart from "./standings/DriverDNFChart";
import DriverGridPositionChart from "./standings/DriverGridPositionChart";
import ConstructorWinsChart from "./standings/ConstructorWinsChart";

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

interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
}

interface DriverStat {
  driver: string;
  driverAcronym: string;
  team: string;
  teamColor: string;
  dnfCount: number;
  totalRaces: number;
  averageGridPosition: number | null;
}

interface ConstructorWin {
  team: string;
  teamColor: string;
  wins: number;
}

const OverallStandings = () => {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<
    ConstructorStanding[]
  >([]);
  const [driverStats, setDriverStats] = useState<DriverStat[]>([]);
  const [constructorWins, setConstructorWins] = useState<ConstructorWin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      API.get("/api/f1/standings/drivers"),
      API.get("/api/f1/standings/constructors"),
      API.get("/api/f1/driver-stats"),
      API.get("/api/f1/constructor-wins"),
    ])
      .then(
        ([
          driversResponse,
          constructorsResponse,
          statsResponse,
          winsResponse,
        ]) => {
          // Handle new response format with season info
          const drivers =
            driversResponse.data.standings || driversResponse.data;
          const constructors =
            constructorsResponse.data.standings || constructorsResponse.data;
          const stats = statsResponse.data.stats || statsResponse.data;
          const wins = winsResponse.data.wins || winsResponse.data;

          setDriverStandings(drivers);
          setConstructorStandings(constructors);
          setDriverStats(stats);
          setConstructorWins(wins);
          setLoading(false);
        }
      )
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingUI />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box sx={{ py: 2 }}>
      {/* Tables Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <DriverStandingsTable standings={driverStandings} />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ConstructorStandingsTable standings={constructorStandings} />
        </Grid>
      </Grid>

      {/* Charts Section - Full Width */}
      <Box sx={{ mt: 4 }}>
        <DriverDNFChart stats={driverStats} />
        <DriverGridPositionChart stats={driverStats} />
        <ConstructorWinsChart wins={constructorWins} />
      </Box>
    </Box>
  );
};

export default OverallStandings;
