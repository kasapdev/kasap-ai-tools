/** Wraps a commander .action() handler so a thrown/rejected error prints a
 * clean message and sets a non-zero exit code, instead of an unhandled
 * rejection stack trace. */
export function withErrorHandling<Args extends unknown[]>(
  fn: (...args: Args) => Promise<void>,
): (...args: Args) => Promise<void> {
  return async (...args: Args) => {
    try {
      await fn(...args);
    } catch (error) {
      console.error("Hata:", error instanceof Error ? error.message : error);
      process.exitCode = 1;
    }
  };
}
