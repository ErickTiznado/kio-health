import { useQuery } from '@tanstack/react-query';
import { accessLogKeys } from '../lib/query-keys';
import {
  getMyAccessLogs,
  getClinicAccessLogs,
  type AccessLogsQuery,
} from '../lib/access-logs.api';

export function useMyAccessLogs(query: AccessLogsQuery, enabled = true) {
  return useQuery({
    queryKey: accessLogKeys.mine(query),
    queryFn: () => getMyAccessLogs(query),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useClinicAccessLogs(query: AccessLogsQuery, enabled: boolean) {
  return useQuery({
    queryKey: accessLogKeys.clinic(query),
    queryFn: () => getClinicAccessLogs(query),
    enabled,
    placeholderData: (prev) => prev,
  });
}
