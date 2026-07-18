import { useTranslation } from "react-i18next";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useState } from "react";
import { PageMeta } from "../../components/common/PageMeta";
import { useAuth } from "../../contexts/AuthContext";

const loginSchema = z.object({
  email: z.string().min(1).email(),
  password: z.string().min(1),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const { t } = useTranslation("admin");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const onSubmit = async (values: LoginFormValues) => {
    setError(false);
    try {
      await login(values);
      navigate("/admin", { replace: true });
    } catch {
      setError(true);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#F7F4EF", px: 3 }}>
      <PageMeta title={t("login.title")} />
      <Box sx={{ width: "100%", maxWidth: 400, bgcolor: "background.paper", p: 5, border: "1px solid", borderColor: "divider" }}>
        <Typography variant="h4" sx={{ mb: 0.5 }}>
          {t("login.title")}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {t("login.subtitle")}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {t("login.error")}
          </Alert>
        )}

        <Stack component="form" spacing={2.5} onSubmit={handleSubmit(onSubmit)}>
          <TextField fullWidth label={t("login.email")} type="email" {...register("email")} error={Boolean(errors.email)} />
          <TextField fullWidth label={t("login.password")} type="password" {...register("password")} error={Boolean(errors.password)} />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {t("login.submit")}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
