import { useEffect, useReducer, useState } from "react";
import { Box, Grid } from "@mui/material";
import API from "../../axios";
import LoadingUI from "../LoadingUI";
import ErrorWidget from "../ErrorWidget";
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

interface StandingsState {
  driverStandings: DriverStanding[];
  constructorStandings: ConstructorStanding[];
  driverStats: DriverStat[];
  constructorWins: ConstructorWin[];
  racePositions: RacePositions;
  loading: boolean;
  error: string | null;
}

type StandingsAction =
  | { type: "FETCH_START" }
  | {
      type: "FETCH_SUCCESS";
      payload: {
        driverStandings: DriverStanding[];
        constructorStandings: ConstructorStanding[];
        driverStats: DriverStat[];
        constructorWins: ConstructorWin[];
        racePositions: RacePositions;
      };
    }
  | { type: "FETCH_ERROR"; payload: string };

const initialState: StandingsState = {
  driverStandings: [],
  constructorStandings: [],
  driverStats: [],
  constructorWins: [],
  racePositions: { races: [], drivers: [] },
  loading: true,
  error: null,
};

function reducer(
  state: StandingsState,
  action: StandingsAction
): StandingsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { ...state, ...action.payload, loading: false };
    case "FETCH_ERROR":
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
}

const OverallStandings = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [retryCount, setRetryCount] = useState(0);
  const retry = () => setRetryCount(n => n + 1);
  const {
    driverStandings,
    constructorStandings,
    driverStats,
    constructorWins,
    racePositions,
    loading,
    error,
  } = state;

  useEffect(() => {
    const fetchAll = async () => {
      dispatch({ type: "FETCH_START" });

      try {
        const [
          driversResponse,
          constructorsResponse,
          statsResponse,
          winsResponse,
          positionsResponse,
        ] = await Promise.all([
          API.get("/api/f1/standings/drivers"),
          API.get("/api/f1/standings/constructors"),
          API.get("/api/f1/driver-stats"),
          API.get("/api/f1/constructor-wins"),
          API.get("/api/f1/driver-race-positions"),
        ]);

        dispatch({
          type: "FETCH_SUCCESS",
          payload: {
            driverStandings:
              driversResponse.data.standings || driversResponse.data,
            constructorStandings:
              constructorsResponse.data.standings || constructorsResponse.data,
            driverStats: statsResponse.data.stats || statsResponse.data,
            constructorWins: winsResponse.data.wins || winsResponse.data,
            racePositions: {
              races: positionsResponse.data.races || [],
              drivers: positionsResponse.data.drivers || [],
            },
          },
        });
      } catch (err) {
        dispatch({
          type: "FETCH_ERROR",
          payload: err instanceof Error ? err.message : "An error occurred",
        });
      }
    };

    fetchAll();
  }, [retryCount]);

  if (loading) return <LoadingUI />;
  if (error) return <ErrorWidget message="Ferrari strategy applied to the API." onRetry={retry} />;

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
        <DriverRacePositionsChart
          races={racePositions.races}
          drivers={racePositions.drivers}
        />
        <DriverDNFChart stats={driverStats} />
        <DriverGridPositionChart stats={driverStats} />
        <ConstructorWinsChart wins={constructorWins} />
      </Box>
    </Box>
  );
};

export default OverallStandings;
