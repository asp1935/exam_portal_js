import { BrowserRouter, Route, Routes } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import './App.css'
import Login from './pages/Login'
import Home from './components/Home'
import Header from './components/Header'
import ProtededRoute from './components/ProtededRoute'
import Dashboard from './pages/Dashboard'
import GuestRoute from './components/GuestRoute'

function App() {
  // const {data,isLoading,isSuccess,isError,error}=useQuery({
  //   queryKey:['user'],
  //   queryFn:getCurrent
  // })
  return (
    <>
      <BrowserRouter>
        <Header />
        <Routes>
          {/* GuestRoute for only if user is not Logged In */}
          <Route element={<GuestRoute />}>
            <Route path='/login' element={<Login />} />
          </Route>

          {/* Protected Route ass per Role  */}
          <Route element={<ProtededRoute allowedRoles={['admin']} />}>
            <Route path='/dashboard' element={<Dashboard />} />
          </Route>

          
          <Route path="*" element={<div>404 - Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
