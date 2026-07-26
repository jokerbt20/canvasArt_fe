import { useState, useCallback } from "react";

/** Map of field name → error message. A field with no entry is valid. */
export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Small composable validators. Each returns an error message when invalid, or `undefined`.
 * Messages are in English to match the admin dashboard's existing field labels.
 */
export const v = {
  required: (value: unknown): string | undefined =>
    value == null || String(value).trim() === "" ? "This field is required." : undefined,

  email: (value: string): string | undefined =>
    value && !EMAIL_RE.test(value.trim()) ? "Enter a valid email address." : undefined,

  minLength:
    (length: number) =>
    (value: string): string | undefined =>
      (value?.trim().length ?? 0) < length ? `Must be at least ${length} characters.` : undefined,

  positiveNumber: (value: unknown): string | undefined => {
    const n = Number(value);
    return value === "" || value == null || Number.isNaN(n) || n <= 0
      ? "Enter a number greater than 0."
      : undefined;
  },

  nonNegativeNumber: (value: unknown): string | undefined => {
    const n = Number(value);
    return value === "" || value == null || Number.isNaN(n) || n < 0
      ? "Enter a number of 0 or more."
      : undefined;
  },

  /** Runs validators in order and returns the first failure. */
  compose:
    (...checks: Array<(value: never) => string | undefined>) =>
    (value: unknown): string | undefined => {
      for (const check of checks) {
        const message = (check as (value: unknown) => string | undefined)(value);
        if (message) return message;
      }
      return undefined;
    },
};

/**
 * Tracks per-field validation errors for a form.
 * `validate(values, rules)` returns true when the form is valid and stores any messages.
 */
export function useFieldErrors<T extends object>() {
  const [errors, setErrors] = useState<FieldErrors<T>>({});

  const validate = useCallback(
    (values: T, rules: Partial<Record<keyof T, (value: never, values: T) => string | undefined>>): boolean => {
      const next: FieldErrors<T> = {};
      for (const key of Object.keys(rules) as (keyof T)[]) {
        const rule = rules[key];
        const message = rule?.(values[key] as never, values);
        if (message) next[key] = message;
      }
      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [],
  );

  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const reset = useCallback(() => setErrors({}), []);

  return { errors, validate, clearError, reset };
}
