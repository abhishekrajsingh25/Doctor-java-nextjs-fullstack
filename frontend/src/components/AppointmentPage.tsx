'use client'

import { useContext, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '@/context/AppContext'
import { assets } from '@/assets/assets'
import RelatedDoctors from '@/components/RelatedDoctors'

/* ================= TYPES ================= */

interface SlotDay {
  date: string
  slots: string[]
}

export interface Doctor {
  id: string
  name: string
  speciality: string
  degree: string
  about: string
  image: string
  fees: number
  experience: string
  available: boolean
}

/* ================= COMPONENT ================= */

const AppointmentPage = () => {
  const router = useRouter()
  const params = useParams()

  // MUST match folder name [docId]
  const docId = params?.docId as string

  const context = useContext(AppContext)
  if (!context) return null

  const {
    doctors,
    currencySymbol,
    backendUrl,
    token,
    getDoctorsData,
  } = context

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const [docInfo, setDocInfo] = useState<Doctor | null>(null)
  const [docSlots, setDocSlots] = useState<SlotDay[]>([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')

  /* ================= SAFETY GUARD ================= */

  useEffect(() => {
    if (!docId || docId === 'undefined') {
      toast.error('Invalid doctor')
      router.replace('/')
    }
  }, [docId, router])

  /* ================= FETCH DOCTOR ================= */

  useEffect(() => {
    if (!doctors.length || !docId) return

    const doctor = doctors.find((d: Doctor) => d.id === docId)

    if (!doctor) {
      toast.error('Doctor not found')
      router.replace('/')
      return
    }

    setDocInfo(doctor)
  }, [doctors, docId, router])

  /* ================= FETCH SLOTS (PUBLIC API) ================= */

  const fetchAvailableSlots = async () => {
  if (!token) {
    toast.warn('Login to view slots')
    router.push('/login')
    return
  }

  try {
    const { data } = await axios.get(
      `${backendUrl}/api/user/doctor-slots`,
      {
        params: {
          doctorId: docId,
          days: 7,
        },
        headers: {
          token,
        },
      }
    )

    if (!data.success) {
      toast.error('Failed to load slots')
      return
    }

    const formatted = Object.entries(data.slots).map(
      ([date, slots]: any) => ({
        date,
        slots,
      })
    )

    setDocSlots(formatted)
    setSlotIndex(0)
    setSlotTime('')
  } catch {
    toast.error('Failed to load slots')
  }
}

  useEffect(() => {
    if (docInfo) {
      fetchAvailableSlots()
    }
  }, [docInfo])

  /* ================= BOOK APPOINTMENT ================= */

  const bookAppointment = async () => {
    if (!token) {
      toast.warn('Login to book appointment')
      router.push('/login')
      return
    }

    if (!slotTime || !docSlots.length) {
      toast.warn('Please select a slot')
      return
    }

    try {
      const slotDate = docSlots[slotIndex].date

      const { data } = await axios.post(
        `${backendUrl}/api/user/book-appointment`,
        {
          docId,
          slotDate,
          slotTime,
        },
        {
          headers: { token },
        }
      )

      if (data.success) {
        toast.success('Appointment booked')
        getDoctorsData()
        router.push('/my-appointments')
      } else {
        toast.error(data.message || 'Booking failed')
      }
    } catch (error: any) {
      toast.error(error.message || 'Booking failed')
    }
  }

  if (!docInfo) return null

  /* ================= UI ================= */

  return (
    <div>
      {/* -------- Doctor Details -------- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div>
          <img
            className="bg-[#5f6fff] w-full sm:max-w-72 rounded-lg"
            src={docInfo.image}
            alt={docInfo.name}
          />
        </div>

        <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
          <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
            {docInfo.name}
            <img className="w-5" src={assets.verified_icon} alt="" />
          </p>

          <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
            <p>
              {docInfo.degree} - {docInfo.speciality}
            </p>
            <button className="py-0.5 px-2 border text-xs rounded-full">
              {docInfo.experience}
            </button>
          </div>

          <div>
            <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
              About <img src={assets.info_icon} alt="" />
            </p>
            <p className="text-sm text-gray-500 max-w-[700px] mt-1">
              {docInfo.about}
            </p>
          </div>

          <p className="text-gray-500 font-medium mt-4">
            Appointment fee:{' '}
            <span className="text-gray-600">
              {currencySymbol}
              {docInfo.fees}
            </span>
          </p>
        </div>
      </div>

      {/* -------- Booking Slots -------- */}
      <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
        <p>Booking Slots</p>

        {/* Days */}
        <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
          {docSlots.map((item, index) => {
            const dateObj = new Date(item.date)

            return (
              <div
                key={item.date}
                onClick={() => {
                  setSlotIndex(index)
                  setSlotTime('')
                }}
                className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${
                  slotIndex === index
                    ? 'bg-[#5f6fff] text-white'
                    : 'border border-gray-200'
                }`}
              >
                <p>{daysOfWeek[dateObj.getDay()]}</p>
                <p>{dateObj.getDate()}</p>
              </div>
            )
          })}
        </div>

        {/* Times */}
        <div className="flex items-center gap-3 w-full overflow-x-scroll mt-4">
          {docSlots.length === 0 && (
            <p className="text-gray-400">No slots available</p>
          )}

          {docSlots[slotIndex]?.slots.map((time) => (
            <p
              key={time}
              onClick={() => setSlotTime(time)}
              className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${
                time === slotTime
                  ? 'bg-[#5f6fff] text-white'
                  : 'text-gray-400 border border-gray-300'
              }`}
            >
              {time.toLowerCase()}
            </p>
          ))}
        </div>

        <button
          onClick={bookAppointment}
          className="bg-[#5f6fff] text-white text-sm font-light px-14 py-3 rounded-full my-6 cursor-pointer"
        >
          Book an Appointment
        </button>
      </div>

      {/* ------- Related Doctors ------- */}
      <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
    </div>
  )
}

export default AppointmentPage
