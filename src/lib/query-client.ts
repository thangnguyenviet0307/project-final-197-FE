import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiError } from "@/lib/api-error"

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => toast.error(getApiError(error).message),
    onSuccess: (_data, _variables, _context, mutation) => {
      if (typeof mutation.meta?.successMessage === "string") toast.success(mutation.meta.successMessage)
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => toast.error(getApiError(error).message),
  }),
  defaultOptions: {
    queries: { retry: false, staleTime: 30_000 },
    mutations: { retry: false },
  },
})
