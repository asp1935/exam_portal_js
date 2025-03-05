import { BrowserRouter, Route, Routes } from 'react-router'
import './App.css'
import Login from './pages/Login'
import Home from './components/Home'
import Header from './components/Header'
import ProtededRoute from './components/ProtededRoute'
import Dashboard from './pages/Dashboard'
import GuestRoute from './components/GuestRoute'
import { getloggedInUser } from './api/api'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/slice/UserSlice'
import { useEffect } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { showToast } from './redux/slice/ToastSlice'
import District from './pages/District'
import Taluka from './pages/Taluka'
import Center from './pages/Center'
import Representative from './pages/Representative'
import School from './pages/School'
import Student from './pages/Student'

function App() {

  const dispatch = useDispatch();


  const setCurrentLoggedInUser = async () => {
    try {
      const responce = await getloggedInUser();
      if (responce?.data) {
        console.log('app', responce.data);

        dispatch(setUserData(responce.data))
        dispatch(showToast({ message: `Welcome Back ${responce.data.role || 'User'}` }))
      }

    } catch (error) {
      dispatch(showToast({ message: error, type: 'error' }))
    }
  }

  useEffect(() => {
    setCurrentLoggedInUser();
  }, [dispatch])




  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          {/* GuestRoute for only if user is not Logged In */}
          <Route element={<GuestRoute />}>
            <Route path='/login' element={<Login />} />
          </Route>

          <Route element={<ProtededRoute />}>
            <Route path='/' element={<Home />}>
              <Route path='/dashboard' element={<Dashboard />} />
              <Route element={<ProtededRoute allowedRoles={['superadmin', 'admin']} />}>
                <Route path='/district' element={<District />} />
                <Route path='/taluka' element={<Taluka />} />
                <Route path='/center' element={<Center />} />
                <Route path='/representative' element={<Representative />} />
                <Route path='/school' element={<School />} />
                <Route path='/student' element={<Student />} />
              </Route>
            </Route>
          </Route>




          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
        <ToastContainer position='top-right' autoClose={3000} theme='light' />
      </BrowserRouter>
    </>
  )
}

export default App
