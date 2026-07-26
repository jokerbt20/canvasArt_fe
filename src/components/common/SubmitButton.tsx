import Button, { type ButtonProps } from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

interface SubmitButtonProps extends ButtonProps {
  /** Shows a spinner and blocks further clicks while true. */
  loading?: boolean;
}

/**
 * A Button that renders an inline spinner and disables itself while `loading`.
 * Use for any action that fires a network request so the user can see it working.
 */
export function SubmitButton({ loading, disabled, children, startIcon, ...rest }: SubmitButtonProps) {
  return (
    <Button
      {...rest}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress size={16} color="inherit" /> : startIcon}
    >
      {children}
    </Button>
  );
}
