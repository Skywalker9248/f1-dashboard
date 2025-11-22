import { useEffect, useState } from "react";
import { Alert, Box, Grid } from "@mui/material";
import API from "../../axios";
import LoadingUI from "../LoadingUI";
import DriverStandingsTable from "./standings/DriverStandingsTable";
import ConstructorStandingsTable from "./standings/ConstructorStandingsTable";
import DriverPointsChart from "./standings/DriverPointsChart";
import ConstructorPointsChart from "./standings/ConstructorPointsChart";

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

const OverallStandings = () => {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<
    ConstructorStanding[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      API.get("/api/f1/standings/drivers"),
      API.get("/api/f1/standings/constructors"),
    ])
      .then(([driversResponse, constructorsResponse]) => {
        // Handle new response format with season info
        const drivers = driversResponse.data.standings || driversResponse.data;
        const constructors =
          constructorsResponse.data.standings || constructorsResponse.data;
        setDriverStandings(drivers);
        setConstructorStandings(constructors);
        setLoading(false);
      })
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
        <DriverPointsChart standings={driverStandings} />
        <ConstructorPointsChart standings={constructorStandings} />
      </Box>
    </Box>
  );
};

export default OverallStandings;
