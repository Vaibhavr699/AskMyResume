import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data } = await api.get('/auth/me');
      return data;
    },
  });
} 