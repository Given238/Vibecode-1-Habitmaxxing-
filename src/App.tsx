import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { HabitStoreProvider } from './contexts/HabitStoreContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { DashboardPage } from './pages/DashboardPage'
import { HabitJournalsPage } from './pages/HabitJournalsPage'
import { MonthlyReviewPage } from './pages/MonthlyReviewPage'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HabitStoreProvider>
                    <AppLayout />
                  </HabitStoreProvider>
                </ProtectedRoute>
              }
            >
              <Route index element={<HomePage />} />
              <Route path="today" element={<DashboardPage />} />
              <Route path="habit/:habitId" element={<HabitJournalsPage />} />
              <Route path="review" element={<MonthlyReviewPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
