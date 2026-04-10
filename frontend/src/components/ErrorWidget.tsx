import type { FC } from "react";
import { Box, Typography, Button } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import styled, { keyframes } from "styled-components";

interface ErrorWidgetProps {
  message: string;
  onRetry: () => void;
  buttonLabel?: string;
}

const pulseAnim = keyframes`
  0%   { opacity: 0.4; transform: scale(1); }
  50%  { opacity: 1;   transform: scale(1.3); }
  100% { opacity: 0.4; transform: scale(1); }
`;

const PulsingDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e10600;
  animation: ${pulseAnim} 1.4s ease-in-out infinite;
  flex-shrink: 0;
`;

const ErrorWidget: FC<ErrorWidgetProps> = ({
  message,
  onRetry,
  buttonLabel = "Ask Fred to Recheck",
}) => {
  return (
    <Box
      sx={{
        width: "100%",
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        py: 1.5,
        px: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        backgroundColor: "background.paper",
      }}
    >
      <PulsingDot />
      <Typography
        variant="caption"
        sx={{
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: 1,
          color: "error.main",
          whiteSpace: "nowrap",
        }}
      >
        DATA FAILED
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ flex: 1, mx: 0.5 }}
      >
        · {message}
      </Typography>
      <Button
        variant="text"
        color="primary"
        size="small"
        startIcon={<RefreshIcon fontSize="small" />}
        onClick={onRetry}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          whiteSpace: "nowrap",
          ml: "auto",
        }}
      >
        {buttonLabel}
      </Button>
    </Box>
  );
};

export default ErrorWidget;
