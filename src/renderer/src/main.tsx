import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App'

//const queryClient = new QueryClient();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      //retry: 2, // default 3 trries if query failed
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false, // deafault:true, when the brrowser tab visited, it is refreshed
      refetchOnReconnect: false,
      //staleTime: 5 * 60 * 1000, // default:0 it define how long data will be fresh which means will be fetched in any change
      refetchOnMount: false // defult:true, by making it false, it will not change while components unmounted or mounted
      // when react-router nav tabs switch components inmounted and mounted
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} /> {/* Add the Devtools here */}
  </QueryClientProvider>
)
