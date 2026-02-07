import Image from 'next/image'
import { assets } from '@/assets/assets'

const Header = () => {
  return (
    <div className="flex flex-col md:flex-row flex-wrap bg-[#5f6fff] rounded-lg px-6 md:px-10 lg:px-20">
      {/* ----- Left Side ----- */}
      <div className="md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]">
        <p className="text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight">
          Book Appointment <br /> With Trusted Doctors
        </p>

        <div className="flex items-center gap-3 text-white text-sm font-light">
          <Image
            src={assets.group_profiles}
            alt="Doctors"
            width={112}
            height={28}
            className="w-28 h-auto"
          />
          <p>
            Simply browse through our extensive list of trusted doctors,
            <br className="hidden sm:block" /> Schedule your appointment
            hassle-free.
          </p>
        </div>

        <a
          href="#speciality"
          className="flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-600 text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300"
        >
          Book Appointment
          <Image
            src={assets.arrow_icon}
            alt="Arrow"
            width={12}
            height={12}
          />
        </a>
      </div>

      {/* ----- Right Side ----- */}
      <div className="md:w-1/2 relative">
        <Image
          src={assets.header_img}
          alt="Header"
          width={600}
          height={500}
          className="w-full md:absolute bottom-0 h-auto rounded-lg"
          priority
        />
      </div>
    </div>
  )
}

export default Header
