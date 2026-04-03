export interface DriverStanding {
  position: number;
  driver: string;
  driverAcronym: string;
  driverNumber: number;
  team: string;
  teamColor: string;
  points: number;
  headshotUrl?: string;
}

export interface ConstructorStanding {
  position: number;
  team: string;
  teamColor: string;
  points: number;
}

export interface DriverStat {
  driver: string;
  driverAcronym: string;
  driverNumber?: number;
  team: string;
  teamColor: string;
  dnfCount: number;
  totalRaces: number;
  averageGridPosition: number | null;
}

export interface ConstructorWin {
  team: string;
  teamColor: string;
  wins: number;
}

export interface DriverPosition {
  driverName: string;
  driverAcronym: string;
  teamColor: string;
  positions: (number | null)[];
}

export interface RacePositions {
  races: string[];
  drivers: DriverPosition[];
}
