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

  address: {
    line: string
    line2: string
  }

  slots_booked: Record<string, string[]>
}

export interface User {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  image: string;
  address: {
    line: string;
    line2: string;
  };
}
