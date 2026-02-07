package com.prescripto.controller;

import com.prescripto.service.SlotService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@SecurityRequirement(name = "UserAuth")
public class UserSlotController {

    private final SlotService slotService;

    public UserSlotController(SlotService slotService) {
        this.slotService = slotService;
    }

    // ✅ USER CAN VIEW AVAILABLE SLOTS
    @GetMapping("/doctor-slots")
    public Map<String, Object> getDoctorSlots(
            @RequestParam String doctorId,
            @RequestParam(defaultValue = "7") int days
    ) {
        return Map.of(
                "success", true,
                "slots", slotService.getAvailableSlots(doctorId, days)
        );
    }
}

