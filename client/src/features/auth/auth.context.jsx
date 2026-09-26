import { createContext, useEffect, useState } from "react";
import { getMe } from './services/auth.api'


export const AuthContext = createContext()

export const AuthProvider = ({children}) =>{
    const [user, setUser]= useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let isActive = true

        const loadUser = async () => {
            try {
                const data = await getMe()
                if (isActive && data?.user) setUser(data.user)
            } finally {
                if (isActive) setLoading(false)
            }
        }

        loadUser()

        return () => {
            isActive = false
        }
    }, [])

    return (
        <AuthContext.Provider value={{user,setUser,loading,setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}