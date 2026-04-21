import { Box, Grid } from "@mui/material";
import useDataFetch from "../../hooks/useDataFetch";
import WidgetWrapper from "../WidgetWrapper";
import DriverStandingsTable from "./standings/DriverStandingsTable";
import ConstructorStandingsTable from "./standings/ConstructorStandingsTable";
import DriverDNFChart from "./standings/DriverDNFChart";
import DriverGridPositionChart from "./standings/DriverGridPositionChart";
import ConstructorWinsChart from "./standings/ConstructorWinsChart";
import DriverRacePositionsChart from "./standings/DriverRacePositionsChart";
import type {
  DriverStanding,
  ConstructorStanding,
  DriverStat,
  ConstructorWin,
  RacePositions,
} from "../../types/f1";

const OverallStandings = () => {
  const driversData = useDataFetch<{ standings: DriverStanding[] }>(
    "/api/f1/standings/drivers"
  );
  const constructorsData = useDataFetch<{ standings: ConstructorStanding[] }>(
    "/api/f1/standings/constructors"
  );
  const dnfData = useDataFetch<{ stats: DriverStat[] }>(
    "/api/f1/driver-stats"
  );
  const gridData = useDataFetch<{ stats: DriverStat[] }>(
    "/api/f1/driver-stats"
  );
  const winsData = useDataFetch<{ wins: ConstructorWin[] }>(
    "/api/f1/constructor-wins"
  );
  const positionsData = useDataFetch<RacePositions>(
    "/api/f1/driver-race-positions"
  );

  return (
    <Box sx={{ py: 2 }}>
      {/* Tables Section */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <WidgetWrapper
            loading={driversData.loading}
            error={driversData.error}
            onRefresh={driversData.retry}
            minHeight={300}
          >
            <DriverStandingsTable
              standings={driversData.data?.standings ?? []}
            />
          </WidgetWrapper>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <WidgetWrapper
            loading={constructorsData.loading}
            error={constructorsData.error}
            onRefresh={constructorsData.retry}
            minHeight={300}
          >
            <ConstructorStandingsTable
              standings={constructorsData.data?.standings ?? []}
            />
          </WidgetWrapper>
        </Grid>
      </Grid>

      {/* Charts Section - Full Width */}
      <Box sx={{ mt: 4 }}>
        <DriverRacePositionsChart
          races={positionsData.data?.races ?? []}
          drivers={positionsData.data?.drivers ?? []}
          loading={positionsData.loading}
          onRefresh={positionsData.retry}
        />
        <DriverDNFChart
          stats={dnfData.data?.stats ?? []}
          loading={dnfData.loading}
          onRefresh={dnfData.retry}
        />
        <DriverGridPositionChart
          stats={gridData.data?.stats ?? []}
          loading={gridData.loading}
          onRefresh={gridData.retry}
        />
        <ConstructorWinsChart
          wins={winsData.data?.wins ?? []}
          loading={winsData.loading}
          onRefresh={winsData.retry}
        />
      </Box>
    </Box>
  );
};

export default OverallStandings;
