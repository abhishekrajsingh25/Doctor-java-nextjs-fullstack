package com.prescripto.ai;

import com.prescripto.model.Doctor;

import java.util.List;

public class DoctorRecommendationPrompt {

    public static String build(
            List<String> symptoms,
            List<Doctor> doctors
    ) {

        StringBuilder sb = new StringBuilder();

        sb.append("""
        You are a doctor recommendation assistant.

        STRICT RULES:
        - Allowed specialities ONLY:
          General physician, Gynecologist, Dermatologist,
          Pediatricians, Neurologist, Gastroenterologist
        - Do NOT mention unavailable specialities (e.g. Cardiology)
        - Use clear, non-repetitive reasons
        - Prefer General physician FIRST for initial assessment
        - Recommend specialists only if symptoms suggest it
        - Return MAXIMUM 5 doctors
        - Return ONLY valid JSON (no markdown, no extra text)

        Patient symptoms:
        """);

        sb.append(String.join(", ", symptoms));
        sb.append("\n\nAvailable doctors:\n");

        int index = 1;
        for (Doctor d : doctors) {
            sb.append(index++)
                    .append(". ")
                    .append(d.getName())
                    .append(" | ")
                    .append(d.getSpeciality())
                    .append(" | ")
                    .append(d.getExperience())
                    .append(" years\n");
        }

        sb.append("""
        
        Return JSON in this exact format:
        {
          "recommendedDoctors": [
            {
              "name": "",
              "speciality": "",
              "reason": ""
            }
          ]
        }
        """);

        return sb.toString();
    }
}
