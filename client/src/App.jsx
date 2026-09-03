import { RouterProvider } from "react-router"
import {router} from './app.routes.jsx'
import { AuthProvider } from "./features/auth/auth.context.jsx"

import './App.css'

function App() {


  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
    
  )
}

export default App
