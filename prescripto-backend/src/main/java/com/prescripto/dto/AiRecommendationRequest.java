package com.prescripto.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class AiRecommendationRequest {

    @NotEmpty
    private List<String> symptoms;
}
