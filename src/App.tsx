import { RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'styled-components'
import { router } from '@/router'
import { AuthProvider } from '@/context/AuthContext'
import { useUiStore } from '@/store/uiStore'
import { lightTheme, darkTheme } from '@/styles/theme'
import GlobalStyles from '@/styles/GlobalStyles'

// QueryClient fuera del componente para que no se recree en cada render
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function ThemedApp() {
  const tema = useUiStore((s) => s.tema)
  const theme = tema === 'oscuro' ? darkTheme : lightTheme

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyles />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemedApp />
    </QueryClientProvider>
  )
}
