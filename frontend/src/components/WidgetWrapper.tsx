import type { ReactNode } from "react";
import { Box, IconButton, Skeleton } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import styled, { keyframes, css } from "styled-components";
import ErrorWidget from "./ErrorWidget";

interface WidgetWrapperProps {
  loading: boolean;
  onRefresh?: () => void;
  error?: string | null;
  children?: ReactNode;
  minHeight?: number;
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const SpinIcon = styled(RefreshIcon)<{ $spinning: boolean }>`
  animation: ${(p) =>
    p.$spinning
      ? css`
          ${spin} 1s linear infinite
        `
      : "none"};
`;

const WidgetWrapper = ({
  loading,
  onRefresh,
  error,
  children,
  minHeight = 220,
}: WidgetWrapperProps) => {
  const body = (() => {
    if (loading)
      return (
        <Skeleton
          variant="rectangular"
          width="100%"
          sx={{ minHeight, borderRadius: 1 }}
        />
      );
    if (error)
      return <ErrorWidget message={error} onRetry={onRefresh ?? (() => {})} />;
    return <>{children}</>;
  })();

  return (
    <Box sx={{ position: "relative" }}>
      {onRefresh && !error && (
        <IconButton
          size="small"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Refresh widget"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: "background.paper",
            boxShadow: 1,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <SpinIcon fontSize="small" $spinning={loading} />
        </IconButton>
      )}
      {body}
    </Box>
  );
};

export default WidgetWrapper;
