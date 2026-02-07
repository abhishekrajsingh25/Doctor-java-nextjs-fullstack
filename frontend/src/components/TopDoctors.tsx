'use client'

import { useContext } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { AppContext } from '@/context/AppContext'

const TopDoctors = () => {
  const router = useRouter()

  const context = useContext(AppContext)
  if (!context) return null

  const { doctors } = context

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>

      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>

      <div className="w-full grid [grid-template-columns:repeat(auto-fill,_minmax(200px,_1fr))] gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctors.slice(0, 10).map((item, index) => (
          <div
            key={item.id ?? index}
            onClick={() => {
              router.push(`/appointment/${item.id}`)
              window.scrollTo(0, 0)
            }}
            className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-300"
          >
            <Image
              src={item.image}
              alt={item.name}
              width={400}
              height={300}
              className="bg-blue-50 w-full h-auto"
            />

            <div className="p-4">
              <div
                className={`flex items-center gap-2 text-sm ${
                  item.available ? 'text-green-500' : 'text-gray-500'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    item.available ? 'bg-green-500' : 'bg-gray-500'
                  }`}
                />
                <p>{item.available ? 'Available' : 'Not Available'}</p>
              </div>

              <p className="text-gray-900 text-lg font-medium">
                {item.name}
              </p>
              <p className="text-gray-600 text-sm">
                {item.speciality}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          router.push('/doctors')
          window.scrollTo(0, 0)
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10 cursor-pointer"
      >
        More
      </button>
    </div>
  )
}

export default TopDoctors
