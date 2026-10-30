import { QueryClient, MutationCache, QueryCache } from "@tanstack/react-query"
import { toast } from "sonner"
import { getApiError } from "@/utils/api-error"
import { publishBusinessChange, subscribeToBusinessChanges } from "@/services/data-sync"

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.suppressGlobalErrorToast) return
      toast.error(getApiError(error).message)
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      publishBusinessChange()
      if (typeof mutation.meta?.successMessage === "string") toast.success(mutation.meta.successMessage)
    },
  }),
  queryCache: new QueryCache({
    onError: (error) => toast.error(getApiError(error).message),
  }),
  defaultOptions: {
    queries: {
      // Refresh on changes/navigation/focus, not a timer that disrupts active views.
      refetchInterval: false,
      retry: false,
      staleTime: 30_000,
      refetchOnMount: "always",
      refetchOnWindowFocus: "always",
      refetchOnReconnect: "always",
    },
    mutations: { retry: false },
  },
})

const stopDataSync = subscribeToBusinessChanges(queryClient, import.meta.hot)
if (import.meta.hot) import.meta.hot.dispose(stopDataSync)
