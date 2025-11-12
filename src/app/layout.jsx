import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChakraProvider } from '@chakra-ui/react';
import HelpWidget from './components/HelpWidget';
import { initAOS } from '../utils/aosConfig';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export default function RootLayout({children}) {
  useEffect(() => {
    // Initialize AOS animations
    initAOS();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider>
        {children}
        <HelpWidget />
      </ChakraProvider>
    </QueryClientProvider>
  );
}