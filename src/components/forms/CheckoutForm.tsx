import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

const checkoutSchema = z.object({
  firstName: z.string().min(1, "required"),
  lastName: z.string().min(1, "required"),
  email: z.string().min(1, "required").email("emailInvalid"),
  phone: z.string().min(1, "required"),
  addressLine: z.string().min(1, "required"),
  city: z.string().min(1, "required"),
  country: z.string().min(1, "required"),
  postalCode: z.string().min(1, "required"),
  notes: z.string().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

interface CheckoutFormProps {
  onSubmit: (values: CheckoutFormValues) => void;
  isSubmitting: boolean;
}

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const { t } = useTranslation("cart");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine: "",
      city: "",
      country: "",
      postalCode: "",
      notes: "",
    },
  });

  const errorText = (field?: { message?: string }) =>
    field?.message ? t(`validation.${field.message}`) : undefined;

  return (
    <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={5}>
      <Stack spacing={2.5}>
        <Typography variant="h6" sx={{ textTransform: "none", fontFamily: "inherit", fontWeight: 500 }}>
          {t("checkout.contactTitle")}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t("checkout.firstName")} {...register("firstName")} error={Boolean(errors.firstName)} helperText={errorText(errors.firstName)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t("checkout.lastName")} {...register("lastName")} error={Boolean(errors.lastName)} helperText={errorText(errors.lastName)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth type="email" label={t("checkout.email")} {...register("email")} error={Boolean(errors.email)} helperText={errorText(errors.email)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField fullWidth label={t("checkout.phone")} {...register("phone")} error={Boolean(errors.phone)} helperText={errorText(errors.phone)} />
          </Grid>
        </Grid>
      </Stack>

      <Stack spacing={2.5}>
        <Typography variant="h6" sx={{ textTransform: "none", fontFamily: "inherit", fontWeight: 500 }}>
          {t("checkout.shippingTitle")}
        </Typography>
        <Grid container spacing={2}>
          <Grid size={12}>
            <TextField fullWidth label={t("checkout.address")} {...register("addressLine")} error={Boolean(errors.addressLine)} helperText={errorText(errors.addressLine)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label={t("checkout.city")} {...register("city")} error={Boolean(errors.city)} helperText={errorText(errors.city)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label={t("checkout.country")} {...register("country")} error={Boolean(errors.country)} helperText={errorText(errors.country)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField fullWidth label={t("checkout.postalCode")} {...register("postalCode")} error={Boolean(errors.postalCode)} helperText={errorText(errors.postalCode)} />
          </Grid>
          <Grid size={12}>
            <TextField fullWidth multiline minRows={3} label={t("checkout.notes")} {...register("notes")} />
          </Grid>
        </Grid>
      </Stack>

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        {isSubmitting ? t("checkout.placingOrder") : t("checkout.placeOrder")}
      </Button>
    </Stack>
  );
}
