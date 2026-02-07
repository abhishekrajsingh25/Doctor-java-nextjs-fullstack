'use client'

import { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '@/context/AppContext'

interface Appointment {
  id: string
  doctorName: string
  speciality: string
  slotDate: string
  slotTime: string
  payment: boolean
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED'
  cancelled: boolean
  isCompleted: boolean
}

const months = [
  '',
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

const slotDateFormat = (slotDate: string) => {
  const d = new Date(slotDate)
  return `${d.getDate()} ${months[d.getMonth() + 1]} ${d.getFullYear()}`
}

const MyAppointmentsPage = () => {
  const context = useContext(AppContext)
  if (!context) return null

  const {
    backendUrl,
    token,
    doctors,
    getDoctorsData,
  } = context

  const [appointments, setAppointments] = useState<Appointment[]>([])

  /* ================= FETCH ================= */

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(
        `${backendUrl}/api/user/appointments`,
        { headers: { token } }
      )

      if (data.success) {
        const normalized = data.appointments.reverse().map((a: any) => ({
          ...a,
          cancelled: a.status === 'CANCELLED',
          isCompleted: a.status === 'COMPLETED',
        }))
        setAppointments(normalized)
      }
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  /* ================= CANCEL ================= */

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/cancel-appointment`,
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getDoctorsData()
      }
    } catch {
      toast.error('Cancel failed')
    }
  }

  /* ================= RAZORPAY ================= */

  const initPay = (order: any, appointmentId: string) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Appointment Payment',
      description: 'Appointment Payment',
      order_id: order.id,
      receipt: order.receipt,

      handler: async (res: any) => {
        try {
          const { data } = await axios.post(
            `${backendUrl}/api/user/verify-razorpay`,
            {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
              appointmentId,
            },
            { headers: { token } }
          )

          if (data.success) {
            toast.success(data.message)
            getUserAppointments()
          } else {
            toast.error(data.message)
          }
        } catch {
          toast.error('Payment verification failed')
        }
      },
    }

    // @ts-ignore
    const rzp = new window.Razorpay(options)
    rzp.open()
  }

  const appointmentRazorpay = async (appointmentId: string) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/user/payment-razorpay`,
        { appointmentId },
        { headers: { token } }
      )

      if (data.success) {
        initPay(data.order, appointmentId)
      }
    } catch {
      toast.error('Payment initiation failed')
    }
  }

  /* ================= INIT ================= */

  useEffect(() => {
    if (!token) return

    getUserAppointments()

    if (doctors.length === 0) {
      getDoctorsData()
    }
  }, [token])

  /* ================= UI (UNCHANGED) ================= */

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b border-gray-300">
        My Appointments
      </p>

      <div>
        {appointments.map((item, index) => {
          const doctor = doctors.find(d => d.name === item.doctorName)

          return (
            <div
              key={item.id ?? index}
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b border-gray-300"
            >
              {/* Doctor Image */}
              <div>
                {doctor && (
                  <img
                    className="w-32 bg-indigo-50"
                    src={doctor.image}
                    alt={doctor.name}
                  />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {item.doctorName}
                </p>
                <p>{item.speciality}</p>

                <p className="text-zinc-700 font-medium mt-1">Address:</p>
                <p className="text-xs">{doctor?.address?.line}</p>
                {doctor?.address?.line2 && (
                  <p className="text-xs">{doctor.address.line2}</p>
                )}

                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">
                    Date & Time:{' '}
                  </span>
                  {slotDateFormat(item.slotDate)} | {item.slotTime}
                </p>
              </div>

              <div></div>

              {/* Actions */}
              <div className="flex flex-col gap-2 justify-end">
                {!item.cancelled && item.payment && !item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-gray-300 rounded text-stone-500 bg-indigo-50">
                    Paid
                  </button>
                )}

                {!item.cancelled && !item.payment && !item.isCompleted && (
                  <button
                    onClick={() => appointmentRazorpay(item.id)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded border-gray-300 cursor-pointer hover:bg-[#5f6fff] hover:text-white transition-all duration-300"
                  >
                    Pay Online
                  </button>
                )}

                {!item.cancelled && !item.isCompleted && (
                  <button
                    onClick={() => cancelAppointment(item.id)}
                    className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded border-gray-300 cursor-pointer hover:bg-red-600 hover:text-white transition-all duration-300"
                  >
                    Cancel Appointment
                  </button>
                )}

                {item.cancelled && !item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-red-500 rounded text-red-500">
                    Appointment Cancelled
                  </button>
                )}

                {item.isCompleted && (
                  <button className="sm:min-w-48 py-2 border border-green-500 rounded text-green-500">
                    Completed
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default MyAppointmentsPage
