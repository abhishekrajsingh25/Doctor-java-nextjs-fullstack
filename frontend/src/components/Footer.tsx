'use client'

import React from 'react'
import { assets } from '@/assets/assets'
import Link from 'next/link'

const Footer = () => {
  return (
    <div className="md:mx-10">
      {/* Main Footer Content */}
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 text-sm">
        {/* ----- Left Section ----- */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="Prescripto Logo" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Our platform allows patients to schedule, reschedule, or cancel
            appointments anytime, reducing wait times and administrative
            burdens. Doctors can manage their schedules efficiently. Experience
            seamless healthcare access with our user-friendly, 24/7 online
            booking system.
          </p>
        </div>

        {/* ----- Center Section ----- */}
        <div>
          <p className="text-xl font-medium mb-5">COMPANY</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>
              <Link href="/" className="hover:text-black">
                Home
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-black">
                About Us
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-black">
                Contact Us
              </Link>
            </li>
            <li>
              <Link href="/" className="hover:text-black">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* ----- Right Section ----- */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+91 9523300556</li>
            <li>abhishekrajsingh2509@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div>
        <hr className="text-gray-300" />
        <p className="py-5 text-sm text-center text-gray-500">
          © 2025 Abhishek Raj Singh — All Rights Reserved.
        </p>
      </div>
    </div>
  )
}

export default Footer
