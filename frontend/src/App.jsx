import { Routes , Route, Navigate } from 'react-router-dom'
import { AuthPage } from './pages/AuthPage.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'
import { Toaster } from 'react-hot-toast'

/* using routes and route components we define paths to different pages */

const App = () => {
  return(
    <>
      {/* mounting the toaster for success/error messagesss */}
      <Toaster/>
      <Routes>
        <Route path='/signup' element={<AuthPage/>}/>
        <Route path='/signin' element={<AuthPage/>}/>
        <Route element={<ProtectedRoute/>}>
          <Route path='/dashboard' element={<Dashboard/>}/>
          { /* adding replace swaps history of navigating to '/' with '/dashboard' */ }
          <Route path='/' element={<Navigate to='/dashboard' replace/>}/>
        </Route>
        <Route path='*' element={<NotFoundPage/>}/>
      </Routes>
    </>
  )
}

export default App