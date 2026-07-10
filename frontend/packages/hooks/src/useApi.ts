import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { apiClient, getErrorMessage } from "@itp/utils";
import type { AxiosRequestConfig } from "axios";

export function useApiQuery<T>(
  key: unknown[],
  url: string,
  config?: AxiosRequestConfig,
  options?: Omit<UseQueryOptions<T>, "queryKey" | "queryFn">
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const { data } = await apiClient.get<T>(url, config);
      return data;
    },
    ...options,
  });
}

export function useApiMutation<TData = unknown, TVariables = unknown>(
  method: "post" | "put" | "patch" | "delete",
  url: string | ((vars: TVariables) => string),
  options?: UseMutationOptions<TData, Error, TVariables>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables) => {
      const endpoint = typeof url === "function" ? url(variables) : url;
      const { data } = await apiClient[method]<TData>(endpoint, variables);
      return data;
    },
    onError: (error) => {
      console.error(getErrorMessage(error));
    },
    ...options,
    onSuccess: (...args) => {
      options?.onSuccess?.(...args);
      void queryClient.invalidateQueries();
    },
  });
}

export { getErrorMessage };
