import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import { useTheme } from "@mui/material/styles";
import { useColorMode } from "../context/ThemeContext";

export default function LoadingUI() {
  const theme = useTheme();
  const { mode } = useColorMode();
  const [loadingText, setLoadingText] = useState("We are checking...");
  const [subText, setSubText] = useState("Standby");
  const [progress, setProgress] = useState(0);

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

  useEffect(() => {
    const textInterval = setInterval(() => {
      const randomPhrase =
        strategyPhrases[Math.floor(Math.random() * strategyPhrases.length)];
      setLoadingText(randomPhrase);
      setSubText(Math.random() > 0.5 ? "Standby" : "Analyzing");
    }, 1000);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 10;
        return prev + 1;
      });
    }, 100);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <Wrapper $theme={theme} $mode={mode}>
      <BackgroundGrid $mode={mode} />
      <TopLine />

      <Content>
        <StatusWrapper>
          <PrimaryMessage>{loadingText}</PrimaryMessage>

          <RadioIndicator theme={theme}>
            <PingingIcon>
              <RadioButtonCheckedIcon fontSize="small" />
            </PingingIcon>

            <RadioButtonCheckedIcon fontSize="small" />
            <SubText>{subText}</SubText>
          </RadioIndicator>
        </StatusWrapper>

        {/* Loader */}
        <LoaderWrapper>
          <LoaderLabel theme={theme}>
            <span>Telemetry</span>
            <span>{progress}%</span>
          </LoaderLabel>

          <LoaderBar theme={theme}>
            <LoaderFill style={{ width: `${progress}%` }} />
          </LoaderBar>

          <WarningWrapper>
            {progress > 90 && (
              <WarningText>
                <WarningAmberIcon sx={{ fontSize: 12 }} /> Strategy confusion
                detected
              </WarningText>
            )}
          </WarningWrapper>
        </LoaderWrapper>

        {/* Cosmetic telemetry */}
        <TelemetryData>
          <div>TIRE_TEMP: CRITICAL</div>
          <div>GAP_TO_LEADER: +24.5s</div>
          <div>STRAT_MODE: 7</div>
          <TelemetryRow>
            HR: 180 <MonitorHeartIcon sx={{ fontSize: 10 }} />
          </TelemetryRow>
        </TelemetryData>
      </Content>
    </Wrapper>
  );
}

/* -------------------- Styled Components -------------------- */

const Wrapper = styled.div<{ $theme: any; $mode: string }>`
  min-height: 100vh;
  background: ${(props) => (props.$mode === "dark" ? "#0d0d0d" : "#f8f8f8")};
  color: ${(props) => (props.$mode === "dark" ? "white" : "#1a1a1a")};
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
  opacity: ${(props) => (props.$mode === "dark" ? "0.1" : "0.05")};
  background-image: radial-gradient(
    ${(props) => (props.$mode === "dark" ? "#444" : "#999")} 1px,
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
  gap: 48px;
`;

const pulse = keyframes`
  0% { opacity: .5; }
  50% { opacity: 1; }
  100% { opacity: .5; }
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

const ping = keyframes`
  0% { transform: scale(1); opacity: .7; }
  100% { transform: scale(2); opacity: 0; }
`;

const RadioIndicator = styled.div<{ theme?: any }>`
  position: relative;
  background: ${(props) =>
    props.theme?.palette?.mode === "dark"
      ? "rgba(0, 0, 0, 0.4)"
      : "rgba(255, 255, 255, 0.6)"};
  border: 1px solid rgba(127, 29, 29, 0.5);
  padding: 6px 16px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ef4444;
`;

const PingingIcon = styled.div`
  position: absolute;
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

const LoaderWrapper = styled.div`
  width: 100%;
`;

const LoaderLabel = styled.div<{ theme?: any }>`
  color: ${(props) =>
    props.theme?.palette?.mode === "dark" ? "#737373" : "#525252"};
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  text-transform: uppercase;
`;

const LoaderBar = styled.div<{ theme?: any }>`
  height: 8px;
  background: ${(props) =>
    props.theme?.palette?.mode === "dark" ? "#1f1f1f" : "#e5e5e5"};
  border: 1px solid
    ${(props) =>
      props.theme?.palette?.mode === "dark" ? "#3a3a3a" : "#d4d4d4"};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
`;

const LoaderFill = styled.div`
  height: 100%;
  background: linear-gradient(to right, #eab308, #dc2626, #eab308);
  transition: width 0.2s ease-out;
`;

const WarningWrapper = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: center;
`;

const WarningText = styled.span`
  font-size: 12px;
  color: #facc15;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const TelemetryData = styled.div`
  position: absolute;
  bottom: 32px;
  right: 32px;
  opacity: 0.3;
  color: #22c55e;
  font-size: 10px;
  font-family: monospace;
  line-height: 1.3;
  display: none;

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
