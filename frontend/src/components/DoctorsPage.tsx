"use client";

import { useContext, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { AppContext } from "@/context/AppContext";

/* ------------------ helpers ------------------ */
const toSlug = (value: string) =>
  value.toLowerCase().replace(/\s+/g, "-");

const fromSlug = (value: string) =>
  value.replace(/-/g, " ").toLowerCase();

/* ------------------ component ------------------ */
const DoctorsPage = () => {
  const router = useRouter();
  const params = useParams();

  const rawSpeciality = params?.speciality as string | undefined;
  const speciality = rawSpeciality ? fromSlug(rawSpeciality) : undefined;

  const context = useContext(AppContext);
  if (!context) return null;

  const { doctors } = context;

  const [filterDoc, setFilterDoc] = useState(doctors);
  const [showFilter, setShowFilter] = useState(false);

  /* ------------------ filtering (FIXED) ------------------ */
  useEffect(() => {
    if (speciality) {
      setFilterDoc(
        doctors.filter(
          (doc) =>
            doc.speciality?.toLowerCase() === speciality
        )
      );
    } else {
      setFilterDoc(doctors);
    }
  }, [doctors, speciality]);

  /* ------------------ navigation ------------------ */
  const navigateSpeciality = (value: string) => {
    const valueSlug = value.toLowerCase();

    if (speciality === valueSlug) {
      router.push("/doctors");
    } else {
      router.push(`/doctors/${toSlug(value)}`);
    }
  };

  /* ------------------ render ------------------ */
  return (
    <div>
      <p className="text-gray-600">
        Browse through the doctors specialist.
      </p>

      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        {/* Mobile filter button */}
        <button
          className={`py-1 px-3 border rounded text-sm transition-all sm:hidden ${
            showFilter ? "bg-[#5f6fff] text-white" : "border-gray-300"
          }`}
          onClick={() => setShowFilter((p) => !p)}
        >
          Filters
        </button>

        {/* Filters */}
        <div
          className={`flex-col gap-4 text-sm text-gray-600 ${
            showFilter ? "flex" : "hidden sm:flex"
          }`}
        >
          {[
            "General physician",
            "Gynecologist",
            "Dermatologist",
            "Pediatricians",
            "Neurologist",
            "Gastroenterologist",
          ].map((item) => {
            const itemLower = item.toLowerCase();

            return (
              <p
                key={item}
                onClick={() => navigateSpeciality(item)}
                className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border rounded cursor-pointer transition-all ${
                  speciality === itemLower
                    ? "bg-indigo-100 text-black border-gray-300"
                    : "border-gray-300"
                }`}
              >
                {item}
              </p>
            );
          })}
        </div>

        {/* Doctor Grid */}
        <div className="w-full grid [grid-template-columns:repeat(auto-fill,_minmax(200px,_1fr))] gap-4 gap-y-6">
          {filterDoc.map((item) => (
            <div
              key={item.id ?? `${item.name}-${item.speciality}`}
              onClick={() => router.push(`/appointment/${item.id}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-all duration-300"
            >
              <Image
                src={item.image}
                alt={item.name}
                width={300}
                height={200}
                className="bg-blue-50 w-full h-auto"
              />

              <div className="p-4">
                <div
                  className={`flex items-center gap-2 text-sm ${
                    item.available ? "text-green-500" : "text-gray-500"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      item.available ? "bg-green-500" : "bg-gray-500"
                    }`}
                  />
                  <p>{item.available ? "Available" : "Not Available"}</p>
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
      </div>
    </div>
  );
};

export default DoctorsPage;
