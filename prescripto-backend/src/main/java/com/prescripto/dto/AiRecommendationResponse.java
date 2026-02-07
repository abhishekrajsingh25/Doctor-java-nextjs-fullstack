package com.prescripto.dto;

import lombok.Data;

import java.util.List;

@Data
public class AiRecommendationResponse {

    private List<RecommendedDoctor> recommendedDoctors;

    @Data
    public static class RecommendedDoctor {
        private String name;
        private String speciality;
        private String reason;
    }
}
