import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { PwaAutoUpdate } from '@/components/PwaAutoUpdate'
import { HomePage } from '@/pages/HomePage'
import { WorkoutPage } from '@/pages/WorkoutPage'
import { CalendarPage } from '@/pages/CalendarPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { BodyWeightPage } from '@/pages/BodyWeightPage'
import { GalleryPage } from '@/pages/GalleryPage'

export default function App() {
  return (
    <BrowserRouter>
      <PwaAutoUpdate />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/workout/:dayId" element={<WorkoutPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/weight" element={<BodyWeightPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
