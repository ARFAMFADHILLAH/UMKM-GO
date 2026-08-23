import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Spinner from './components/ui/Spinner'
import { useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Explore = lazy(() => import('./pages/Explore'))
const UmkmDetail = lazy(() => import('./pages/UmkmDetail'))
const MapPage = lazy(() => import('./pages/MapPage'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const ManageUmkm = lazy(() => import('./pages/ManageUmkm'))
const NotFound = lazy(() => import('./pages/NotFound'))

function fullPageSpinner() {
  return (
    <div className="grid min-h-svh place-items-center bg-cream-50">
      <Spinner />
    </div>
  )
}

function RequireAuth({ children }) {
  const { user, booting } = useAuth()
  const location = useLocation()
  if (booting) return fullPageSpinner()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

function GuestOnly({ children }) {
  const { user, booting } = useAuth()
  if (booting) return fullPageSpinner()
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={fullPageSpinner()}>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="explore" element={<Explore />} />
            <Route path="umkms/:slug" element={<UmkmDetail />} />
            <Route path="peta" element={<MapPage />} />
            <Route path="login" element={<GuestOnly><Login /></GuestOnly>} />
            <Route path="register" element={<GuestOnly><Register /></GuestOnly>} />
            <Route path="dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="manage/new" element={<RequireAuth><ManageUmkm /></RequireAuth>} />
            <Route path="manage/:slug" element={<RequireAuth><ManageUmkm /></RequireAuth>} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
