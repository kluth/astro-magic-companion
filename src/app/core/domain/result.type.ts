/**
 * Result pattern for explicit error handling.
 */
export type Result<T, E = Error> = 
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: E };

export const success = <T>(value: T): Result<T, never> => ({
  success: true,
  value
});

export const failure = <E>(error: E): Result<never, E> => ({
  success: false,
  error
});
