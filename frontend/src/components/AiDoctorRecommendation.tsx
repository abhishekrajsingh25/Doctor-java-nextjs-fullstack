'use client'

import { useContext, useState } from 'react'
import axios from 'axios'
import { AppContext } from '@/context/AppContext'
import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'

interface RecommendedDoctor {
  name: string
  speciality: string
  reason: string
}

const AiDoctorRecommendation = () => {
  const router = useRouter()

  const context = useContext(AppContext)
  if (!context) return null

  const { backendUrl, token } = context

  const [symptoms, setSymptoms] = useState('')
  const [loading, setLoading] = useState(false)
  const [recommendations, setRecommendations] = useState<
    RecommendedDoctor[]
  >([])

  const getRecommendation = async () => {
    if (!token) {
      toast.warn('Login to get AI recommendations')
      router.push('/login')
      return
    }

    if (!symptoms.trim()) {
      toast.warn('Please enter symptoms')
      return
    }

    try {
      setLoading(true)

      const { data } = await axios.post(
        `${backendUrl}/api/ai/recommend-doctor`,
        {
          symptoms: symptoms.split(',').map((s) => s.trim()),
        },
        {
          headers: { token },
        }
      )

      if (data.success) {
        setRecommendations(data.data.recommendedDoctors)
      } else {
        toast.error('AI failed to recommend')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-indigo-50 p-6 rounded-xl my-12">
      <h2 className="text-2xl font-semibold text-gray-800 mb-2">
        🤖 AI Doctor Recommendation
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Describe your symptoms (comma separated)
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          className="flex-1 border border-gray-300 rounded px-4 py-2"
          placeholder="e.g. chest pain, shortness of breath"
          value={symptoms}
          onChange={(e) => setSymptoms(e.target.value)}
        />

        <button
          onClick={getRecommendation}
          disabled={loading}
          className="bg-[#5f6fff] text-white px-6 py-2 rounded hover:opacity-90"
        >
          {loading ? 'Analyzing...' : 'Get Recommendation'}
        </button>
      </div>

      {recommendations.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {recommendations.map((doc, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md"
              onClick={() =>
                router.push(`/doctors/${doc.speciality}`)
              }
            >
              <p className="font-medium text-gray-900">{doc.name}</p>
              <p className="text-sm text-gray-600">{doc.speciality}</p>
              <p className="text-xs text-gray-500 mt-2">{doc.reason}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default AiDoctorRecommendation
