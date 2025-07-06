import { ThemeProvider } from './contexts/ThemeContext'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <ThemeProvider>
      <HomePage />
    </ThemeProvider>
  )
}
