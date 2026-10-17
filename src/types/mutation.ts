import type { UseMutationOptions } from "@tanstack/react-query"

export type MutationCallbacks<TData, TVariables> = Pick<
  UseMutationOptions<TData, Error, TVariables>,
  "onSuccess" | "onError" | "onSettled"
>
