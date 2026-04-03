import { Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/Layout"
import { HomePage } from "./pages/HomePage"
import { ScriptsPage } from "./pages/ScriptsPage"
import { VideosPage } from "./pages/VideosPage"
import { MaterialsPage } from "./pages/MaterialsPage"
import { PublishingPage } from "./pages/PublishingPage"
import { AnalyticsPage } from "./pages/AnalyticsPage"
import { LoginPage } from "./pages/LoginPage"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem("token")
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="scripts" element={<ScriptsPage />} />
        <Route path="videos" element={<VideosPage />} />
        <Route path="materials" element={<MaterialsPage />} />
        <Route path="publishing" element={<PublishingPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
