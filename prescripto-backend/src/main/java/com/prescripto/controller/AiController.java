package com.prescripto.controller;

import com.prescripto.dto.AiRecommendationRequest;
import com.prescripto.service.AiService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@SecurityRequirement(name = "UserAuth")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/recommend-doctor")
    public Map<String, Object> recommendDoctor(
            @Valid @RequestBody AiRecommendationRequest request
    ) {
        return Map.of(
                "success", true,
                "data",
                aiService.recommendDoctors(request.getSymptoms())
        );
    }
}
