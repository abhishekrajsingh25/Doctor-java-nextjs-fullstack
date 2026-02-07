'use client'

import { useContext, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { AppContext } from '@/context/AppContext'
import { assets } from '@/assets/assets'

const Navbar = () => {
  const router = useRouter()
  const pathname = usePathname()

  const context = useContext(AppContext)
  if (!context) return null

  const { token, setToken, userData, isAuthLoading } = context

  const [showMenu, setShowMenu] = useState(false)

  const logout = () => {
    setToken(null)
    document.cookie = 'token=; path=/; max-age=0'
    localStorage.removeItem('token')
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-300">
      {/* Logo */}
      <img
        onClick={() => router.push('/')}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="logo"
      />

      {/* Desktop Menu */}
      <ul className="hidden md:flex items-start gap-5 font-medium">
        <li>
          <Link href="/" className="py-1 block">
            HOME
            <hr
              className={`border-none h-0.5 bg-[#5f6fff] w-3/5 m-auto ${
                isActive('/') ? 'block' : 'hidden'
              }`}
            />
          </Link>
        </li>

        <li>
          <Link href="/doctors" className="py-1 block">
            ALL DOCTORS
            <hr
              className={`border-none h-0.5 bg-[#5f6fff] w-3/5 m-auto ${
                pathname.startsWith('/doctors') ? 'block' : 'hidden'
              }`}
            />
          </Link>
        </li>

        <li>
          <Link href="/about" className="py-1 block">
            ABOUT
            <hr
              className={`border-none h-0.5 bg-[#5f6fff] w-3/5 m-auto ${
                isActive('/about') ? 'block' : 'hidden'
              }`}
            />
          </Link>
        </li>

        <li>
          <Link href="/contact" className="py-1 block">
            CONTACT
            <hr
              className={`border-none h-0.5 bg-[#5f6fff] w-3/5 m-auto ${
                isActive('/contact') ? 'block' : 'hidden'
              }`}
            />
          </Link>
        </li>
      </ul>

      {/* Right Side */}
      <div className="flex items-center gap-4">
        {/* ✅ AUTH-AWARE UI */}
        {isAuthLoading ? null : token ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img
              className="w-10 h-10 rounded-full"
              src={userData?.image || assets.profile_pic}
              alt="user"
            />
            <img
              className="w-2.5"
              src={assets.dropdown_icon}
              alt="dropdown"
            />

            {/* Dropdown */}
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => router.push('/my-profile')}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => router.push('/my-appointments')}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p
                  onClick={logout}
                  className="hover:text-black cursor-pointer"
                >
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => router.push('/login')}
            className="bg-[#5f6fff] text-white px-8 py-3 rounded-full font-light cursor-pointer"
          >
            Create Account
          </button>
        )}

        {/* Mobile Menu Icon */}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt="menu"
        />

        {/* Mobile Menu */}
        <div
          className={`${
            showMenu ? 'fixed w-full' : 'h-0 w-0'
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all duration-300`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="logo" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt="close"
            />
          </div>

          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <li>
              <Link href="/" onClick={() => setShowMenu(false)}>
                HOME
              </Link>
            </li>
            <li>
              <Link href="/doctors" onClick={() => setShowMenu(false)}>
                ALL DOCTORS
              </Link>
            </li>
            <li>
              <Link href="/about" onClick={() => setShowMenu(false)}>
                ABOUT
              </Link>
            </li>
            <li>
              <Link href="/contact" onClick={() => setShowMenu(false)}>
                CONTACT
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar
