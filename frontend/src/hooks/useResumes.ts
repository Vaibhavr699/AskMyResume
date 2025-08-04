import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

export function useResumes(options = {}) {
  return useQuery({
    queryKey: ['resumes'],
    queryFn: async () => {
      try {
        const { data } = await api.get('/resumes');
        return data || [];
      } catch (error: any) {
        console.error('Error fetching resumes:', error);
        throw new Error(error.response?.data?.error || 'Failed to fetch resumes');
      }
    },
    retry: 2,
    retryDelay: 1000,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: false,
    ...options,
  });
}
 
 
 
 
 