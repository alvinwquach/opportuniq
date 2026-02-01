/**
 * Diagnose Page GraphQL Hooks
 *
 * Hooks for fetching and managing diagnose page data.
 */

import { useQuery } from "@tanstack/react-query";
import { gqlRequest } from "../client";
import { queryKeys } from "../keys";
import { DIAGNOSE_PAGE_DATA_QUERY } from "../queries";
import type { DiagnosePageDataResponse } from "../types";

/**
 * Fetch comprehensive diagnose page data
 *
 * @param issueId - Optional issue ID to select specific issue
 * @returns Query result with diagnose page data
 *
 * @example
 * const { data, isLoading } = useDiagnosePageData();
 * const { data: issueData } = useDiagnosePageData("issue-id-123");
 */
export function useDiagnosePageData(issueId?: string) {
  return useQuery({
    queryKey: queryKeys.diagnose.pageData(issueId),
    queryFn: async () => {
      const response = await gqlRequest<{
        diagnosePageData: DiagnosePageDataResponse;
      }>(DIAGNOSE_PAGE_DATA_QUERY, { issueId });
      return response.diagnosePageData;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
