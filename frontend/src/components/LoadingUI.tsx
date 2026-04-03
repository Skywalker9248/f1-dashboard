import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useColorMode } from "../context/ThemeContext";

// --- Module-level constants (fixes exhaustive-deps warning) ---

const strategyPhrases = [
  "We are checking...",
  "Head down, we are checking...",
  "Slow button on...",
  "Plan E... or F...",
  "Box box... no, stay out!",
  "Question?",
  "Tires are gone...",
  "Calculating gap...",
  "Reviewing data...",
  "Copy that.",
  "Something is wet... must be the water...",
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

interface Telemetry {
  rpm: number;
  speed: number;
  gear: number;
}

// --- Component ---

export default function LoadingUI() {
  const { mode } = useColorMode();

  const [loadingText, setLoadingText] = useState(strategyPhrases[0]);
  const [subText, setSubText] = useState<"Standby" | "Analyzing">("Standby");
  const [activeSector, setActiveSector] = useState(0); // 0 = S1, 1 = S2, 2 = S3
  const [telemetry, setTelemetry] = useState<Telemetry>({
    rpm: randomInt(8000, 12500),
    speed: randomInt(200, 340),
    gear: randomInt(4, 8),
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingText(
        strategyPhrases[Math.floor(Math.random() * strategyPhrases.length)]
      );
      setSubText(Math.random() > 0.5 ? "Standby" : "Analyzing");
      setActiveSector((s) => (s + 1) % 3);
      setTelemetry({
        rpm: randomInt(8000, 12500),
        speed: randomInt(200, 340),
        gear: randomInt(4, 8),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Wrapper $mode={mode}>
      <BackgroundGrid $mode={mode} />
      <TopLine />

      <Content>
        <StatusWrapper>
          <PrimaryMessage>{loadingText}</PrimaryMessage>

          <RadioIndicator $mode={mode}>
            <PingingIcon>
              <RadioButtonCheckedIcon fontSize="small" />
            </PingingIcon>
            <RadioButtonCheckedIcon fontSize="small" />
            <SubText>{subText}</SubText>
          </RadioIndicator>
        </StatusWrapper>

        {/* Sector strip */}
        <SectorStrip>
          {(["S1", "S2", "S3"] as const).map((label, i) => (
            <SectorBox
              key={label}
              $state={
                i < activeSector ? "done" : i === activeSector ? "active" : "pending"
              }
            >
              {label}
            </SectorBox>
          ))}
        </SectorStrip>

        {/* Progress bar */}
        <LoaderWrapper>
          <LoaderLabel $mode={mode}>
            <span>Telemetry</span>
            <WarningText>
              <WarningAmberIcon sx={{ fontSize: 12 }} /> Strategy confusion detected
            </WarningText>
          </LoaderLabel>
          <LoaderBar $mode={mode}>
            <LoaderFill />
          </LoaderBar>
        </LoaderWrapper>

        {/* Animated telemetry */}
        <TelemetryData>
          <div>RPM: {telemetry.rpm.toLocaleString()}</div>
          <div>SPEED: {telemetry.speed} km/h</div>
          <div>GEAR: {telemetry.gear}</div>
          <div>TIRE_TEMP: CRITICAL</div>
          <div>STRAT_MODE: 7</div>
          <TelemetryRow>
            HR: 180 <MonitorHeartIcon sx={{ fontSize: 10 }} />
          </TelemetryRow>
        </TelemetryData>
      </Content>
    </Wrapper>
  );
}

/* -------------------- Animations -------------------- */

const pulse = keyframes`
  0%   { opacity: .5; }
  50%  { opacity: 1; }
  100% { opacity: .5; }
`;

const ping = keyframes`
  0%   { transform: scale(1); opacity: .7; }
  100% { transform: scale(2); opacity: 0; }
`;

const sweep = keyframes`
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`;

const sectorPulse = keyframes`
  0%   { opacity: 1; }
  50%  { opacity: 0.4; }
  100% { opacity: 1; }
`;

/* -------------------- Styled Components -------------------- */

const Wrapper = styled.div<{ $mode: string }>`
  min-height: 100vh;
  background: ${(p) => (p.$mode === "dark" ? "#0d0d0d" : "#f8f8f8")};
  color: ${(p) => (p.$mode === "dark" ? "white" : "#1a1a1a")};
  font-family: monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  padding: 16px;
  overflow: hidden;
`;

const BackgroundGrid = styled.div<{ $mode: string }>`
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: ${(p) => (p.$mode === "dark" ? "0.1" : "0.05")};
  background-image: radial-gradient(
    ${(p) => (p.$mode === "dark" ? "#444" : "#999")} 1px,
    transparent 1px
  );
  background-size: 20px 20px;
`;

const TopLine = styled.div`
  position: absolute;
  top: 0;
  height: 4px;
  width: 100%;
  background: linear-gradient(to right, transparent, #dc2626, transparent);
  opacity: 0.5;
`;

const Content = styled.div`
  z-index: 10;
  max-width: 420px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 36px;
`;

const PrimaryMessage = styled.h2`
  font-size: 28px;
  font-weight: bold;
  color: #facc15;
  text-transform: uppercase;
  letter-spacing: 2px;
  animation: ${pulse} 1.5s infinite;
  text-align: center;
`;

const StatusWrapper = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const RadioIndicator = styled.div<{ $mode: string }>`
  position: relative;
  background: ${(p) =>
    p.$mode === "dark" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.6)"};
  border: 1px solid rgba(127, 29, 29, 0.5);
  padding: 6px 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ef4444;
`;

const PingingIcon = styled.div`
  position: absolute;
  left: 16px;
  animation: ${ping} 1.2s infinite;
  opacity: 0.75;
`;

const SubText = styled.span`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #f87171;
  font-weight: bold;
`;

/* --- Sector strip --- */

const SectorStrip = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
`;

const SectorBox = styled.div<{ $state: "done" | "active" | "pending" }>`
  flex: 1;
  text-align: center;
  padding: 6px 0;
  font-size: 11px;
  font-weight: bold;
  letter-spacing: 0.15em;
  border-radius: 4px;
  border: 1px solid
    ${(p) =>
      p.$state === "done"
        ? "#16a34a"
        : p.$state === "active"
        ? "#eab308"
        : "#3a3a3a"};
  color: ${(p) =>
    p.$state === "done"
      ? "#22c55e"
      : p.$state === "active"
      ? "#facc15"
      : "#525252"};
  background: ${(p) =>
    p.$state === "done"
      ? "rgba(22,163,74,0.1)"
      : p.$state === "active"
      ? "rgba(234,179,8,0.1)"
      : "transparent"};
  animation: ${(p) => (p.$state === "active" ? sectorPulse : "none")} 0.8s
    infinite;
`;

/* --- Progress bar --- */

const LoaderWrapper = styled.div`
  width: 100%;
`;

const LoaderLabel = styled.div<{ $mode: string }>`
  color: ${(p) => (p.$mode === "dark" ? "#737373" : "#525252")};
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-transform: uppercase;
  margin-bottom: 4px;
`;

const WarningText = styled.span`
  font-size: 11px;
  color: #facc15;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const LoaderBar = styled.div<{ $mode: string }>`
  height: 8px;
  background: ${(p) => (p.$mode === "dark" ? "#1f1f1f" : "#e5e5e5")};
  border: 1px solid ${(p) => (p.$mode === "dark" ? "#3a3a3a" : "#d4d4d4")};
  border-radius: 4px;
  overflow: hidden;
`;

const LoaderFill = styled.div`
  height: 100%;
  width: 30%;
  background: linear-gradient(to right, #eab308, #dc2626, #eab308);
  animation: ${sweep} 1.6s ease-in-out infinite;
`;

/* --- Telemetry panel --- */

const TelemetryData = styled.div`
  position: absolute;
  bottom: 32px;
  right: 32px;
  opacity: 0.4;
  color: #22c55e;
  font-size: 10px;
  font-family: monospace;
  line-height: 1.6;
  display: none;
  text-align: right;

  @media (min-width: 768px) {
    display: block;
  }
`;

const TelemetryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
`;
