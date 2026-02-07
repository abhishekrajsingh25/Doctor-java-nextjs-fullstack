'use client'

import { createContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { Doctor, User } from '@/types'

interface AppContextType {
  backendUrl: string
  doctors: Doctor[]
  getDoctorsData: () => Promise<void>
  token: string | null
  setToken: (token: string | null) => void
  userData: User | null
  setUserData: (user: User | null) => void
  loadUserProfileData: () => Promise<void>
  currencySymbol: string
  isAuthLoading: boolean
}

export const AppContext = createContext<AppContextType | null>(null)

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL as string
  const currencySymbol = '$'

  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [token, setToken] = useState<string | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Restore token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    if (storedToken) {
      setToken(storedToken)
    }
    setIsAuthLoading(false)
  }, [])

  const getDoctorsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/list`)
      if (data.success) setDoctors(data.doctors)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const loadUserProfileData = async () => {
    if (!token) {
      setUserData(null)
      return
    }

    try {
      setIsAuthLoading(true)

      const { data } = await axios.get(
        `${backendUrl}/api/user/get-profile`,
        { headers: { token } }
      )

      if (data.success) {
        setUserData(data.user)
      } else {
        setUserData(null)
      }
    } catch (error: any) {
      setUserData(null)
      toast.error(error.message)
    } finally {
      setIsAuthLoading(false)
    }
  }

  useEffect(() => {
    getDoctorsData()
  }, [])

  useEffect(() => {
    if (token) loadUserProfileData()
    else setUserData(null)
  }, [token])

  return (
    <AppContext.Provider
      value={{
        backendUrl,
        doctors,
        getDoctorsData,
        token,
        setToken,
        userData,
        setUserData,
        loadUserProfileData,
        currencySymbol,
        isAuthLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export default AppContextProvider
