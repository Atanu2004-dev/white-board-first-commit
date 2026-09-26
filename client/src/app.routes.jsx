import { createBrowserRouter } from 'react-router';
import Login from './features/auth/pages/Login'
import Register from './features/auth/pages/Register'
import Protected from './features/auth/components/Protected'
import Dashboard from './features/white-board/pages/Dashboard';
import Board from './features/white-board/pages/Board';

export const router = createBrowserRouter([
    {
        path: '/login',
        element:<Login/>
    },
    {
        path: '/register',
        element:<Register/>
    },    
    {
        path: '/',
        element: <Protected><Dashboard/></Protected>
    },
    {
        path:"/board/:boardId" ,
        element:<Board />
    }

    
])