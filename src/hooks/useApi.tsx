import { useQuery } from '@tanstack/react-query';

const fetchData = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
};

export const useApi = (url: string, queryKey: string) => {
  return useQuery({
    queryKey: [queryKey],
    queryFn: () => fetchData(url),
  });
};