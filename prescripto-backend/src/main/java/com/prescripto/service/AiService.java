package com.prescripto.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prescripto.ai.DoctorRecommendationPrompt;
import com.prescripto.ai.GroqClient;
import com.prescripto.dto.AiRecommendationResponse;
import com.prescripto.model.Doctor;
import com.prescripto.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AiService {

    private final DoctorRepository doctorRepository;
    private final GroqClient groqClient;
    private final ObjectMapper mapper = new ObjectMapper();

    public AiService(
            DoctorRepository doctorRepository,
            GroqClient groqClient
    ) {
        this.doctorRepository = doctorRepository;
        this.groqClient = groqClient;
    }

    public AiRecommendationResponse recommendDoctors(
            List<String> symptoms
    ) {

        if (symptoms == null || symptoms.isEmpty()) {
            throw new RuntimeException("Symptoms required");
        }

        List<Doctor> doctors =
                doctorRepository.findByAvailableTrue();

        String prompt =
                DoctorRecommendationPrompt.build(symptoms, doctors);

        String aiRawResponse = groqClient.ask(prompt);

        // 🔥 CLEAN AI RESPONSE (same as MERN)
        String clean =
                aiRawResponse
                        .replace("```json", "")
                        .replace("```", "")
                        .trim();

        try {
            return mapper.readValue(
                    clean,
                    AiRecommendationResponse.class
            );
        } catch (Exception e) {
            throw new RuntimeException(
                    "AI response parsing failed",
                    e
            );
        }
    }
}
