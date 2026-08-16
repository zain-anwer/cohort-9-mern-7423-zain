import { Routes , Route } from 'react-router-dom'
import { SignupPage } from './pages/SignupPage.jsx'
import { SigninPage } from './pages/SigninPage.jsx'
import { Dashboard } from './pages/Dashboard.jsx'
import { NoteEditor } from './pages/NoteEditor.jsx'
import { UserProfile } from './pages/UserProfile.jsx'

/* using routes and route components we define paths to different pages */

const App = () => {
  return(
    <Routes>
      <Route path='/signup' element={<SignupPage/>}/>
      <Route path='/signin' element={<SigninPage/>}/>
      <Route path='/dashboard' element={<Dashboard/>}/>
      <Route path='/dashboard/notes/:note-id' element={<NoteEditor/>}/>
      <Route path='/profile' element={<UserProfile/>}/>
    </Routes>
  )
}

export default App