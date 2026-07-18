import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { useSubmitContactMessage } from "../../hooks/useContact";

const contactSchema = z.object({
  name: z.string().min(1, "nameRequired"),
  email: z.string().min(1, "nameRequired").email("emailInvalid"),
  subject: z.string().optional(),
  message: z.string().min(1, "messageRequired"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const { t } = useTranslation("contact");
  const submitMessage = useSubmitContactMessage();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (values: ContactFormValues) => {
    try {
      await submitMessage.mutateAsync(values);
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  const errorText = (field?: { message?: string }) =>
    field?.message ? t(`validation.${field.message}`) : undefined;

  return (
    <Stack component="form" onSubmit={handleSubmit(onSubmit)} spacing={2.5}>
      {status === "success" && <Alert severity="success">{t("form.success")}</Alert>}
      {status === "error" && <Alert severity="error">{t("form.error")}</Alert>}

      <TextField fullWidth label={t("form.name")} {...register("name")} error={Boolean(errors.name)} helperText={errorText(errors.name)} />
      <TextField fullWidth type="email" label={t("form.email")} {...register("email")} error={Boolean(errors.email)} helperText={errorText(errors.email)} />
      <TextField fullWidth label={t("form.subject")} {...register("subject")} />
      <TextField fullWidth multiline minRows={5} label={t("form.message")} {...register("message")} error={Boolean(errors.message)} helperText={errorText(errors.message)} />

      <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
        {t("form.submit")}
      </Button>
    </Stack>
  );
}
