import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { HomePage } from '@/pages/HomePage'
import { WorkoutPage } from '@/pages/WorkoutPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { BodyWeightPage } from '@/pages/BodyWeightPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/workout/:dayId" element={<WorkoutPage />} />
          <Route path="/weight" element={<BodyWeightPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
