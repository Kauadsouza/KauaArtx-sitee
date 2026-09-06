/** Bound backend outages while preserving cancellation requested by the caller. */
export const supabaseFetch: typeof fetch = (input, init) => fetch(input, {
  ...init,
  signal: init?.signal
    ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
    : AbortSignal.timeout(15000),
});
