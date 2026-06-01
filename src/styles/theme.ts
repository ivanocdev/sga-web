export interface Theme {
  bg: string
  surface: string
  surfaceHover: string
  border: string
  text: string
  textMuted: string
  primary: string
  primaryHover: string
  primaryLight: string
  danger: string
  success: string
  warning: string
  // sidebar siempre oscuro, independiente del tema
  sidebar: string
  sidebarHover: string
  sidebarActive: string
  sidebarText: string
  sidebarTextActive: string
  sidebarBorder: string
  // inputs y formularios
  inputBg: string
  inputBorder: string
  inputFocus: string
  // sombras
  shadow: string
  shadowCard: string
}

export const lightTheme: Theme = {
  bg: '#f1f5f9',
  surface: '#ffffff',
  surfaceHover: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  primary: '#2563eb',
  primaryHover: '#1d4ed8',
  primaryLight: 'rgba(37, 99, 235, 0.1)',
  danger: '#dc2626',
  success: '#16a34a',
  warning: '#d97706',
  sidebar: '#1e293b',
  sidebarHover: 'rgba(255, 255, 255, 0.07)',
  sidebarActive: 'rgba(255, 255, 255, 0.12)',
  sidebarText: '#94a3b8',
  sidebarTextActive: '#f1f5f9',
  sidebarBorder: 'rgba(255, 255, 255, 0.06)',
  inputBg: '#ffffff',
  inputBorder: '#cbd5e1',
  inputFocus: '#2563eb',
  shadow: '0 1px 3px rgba(0,0,0,0.08)',
  shadowCard: '0 2px 8px rgba(0,0,0,0.08)',
}

export const darkTheme: Theme = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceHover: '#263246',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  primary: '#3b82f6',
  primaryHover: '#2563eb',
  primaryLight: 'rgba(59, 130, 246, 0.15)',
  danger: '#ef4444',
  success: '#22c55e',
  warning: '#f59e0b',
  sidebar: '#0f172a',
  sidebarHover: 'rgba(255, 255, 255, 0.06)',
  sidebarActive: 'rgba(255, 255, 255, 0.1)',
  sidebarText: '#64748b',
  sidebarTextActive: '#f1f5f9',
  sidebarBorder: 'rgba(255, 255, 255, 0.05)',
  inputBg: '#1e293b',
  inputBorder: '#334155',
  inputFocus: '#3b82f6',
  shadow: '0 1px 3px rgba(0,0,0,0.3)',
  shadowCard: '0 2px 8px rgba(0,0,0,0.3)',
}
