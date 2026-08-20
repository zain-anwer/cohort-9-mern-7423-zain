import { Routes , Route, Navigate } from 'react-router-dom'
import { SignupPage } from './pages/SignupPage.jsx'
import { SigninPage } from './pages/SigninPage.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { NoteEditor } from './pages/NoteEditor.jsx'
import { UserProfile } from './pages/UserProfile.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { ProtectedRoute } from './components/ProtectedRoute.jsx'

/* using routes and route components we define paths to different pages */

const App = () => {
  return(
    <Routes>
      <Route path='/signup' element={<SignupPage/>}/>
      <Route path='/signin' element={<SigninPage/>}/>
      <Route element={<ProtectedRoute/>}>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/dashboard/notes/:id' element={<NoteEditor/>}/>
        
        { /* adding replace swaps history of navigating to '/' with '/dashboard' */ }
        <Route path='/' element={<Navigate to='/dashboard' replace/>}/>
        <Route path='/profile' element={<UserProfile/>}/>
      </Route>
      <Route path='*' element={<NotFoundPage/>}/>
    </Routes>
  )
}

export default App