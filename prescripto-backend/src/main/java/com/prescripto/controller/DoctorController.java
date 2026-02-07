package com.prescripto.controller;

import com.prescripto.dto.LoginRequest;
import com.prescripto.model.Doctor;
import com.prescripto.security.JwtUtil;
import com.prescripto.service.DoctorService;
import com.prescripto.service.SlotService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
@SecurityRequirement(name = "DoctorAuth")
public class DoctorController {

    private final DoctorService doctorService;
    private final JwtUtil jwtUtil;
    private final SlotService slotService;

    public DoctorController(DoctorService doctorService, JwtUtil jwtUtil, SlotService slotService) {
        this.doctorService = doctorService;
        this.jwtUtil = jwtUtil;
        this.slotService = slotService;
    }

    // ✅ PUBLIC — List Doctors
    @GetMapping("/list")
    public Map<String, Object> listDoctors() throws Exception {
        return Map.of(
                "success", true,
                "doctors", doctorService.listDoctors()
        );
    }

    // ✅ PUBLIC — Doctor Login
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {

        String token = doctorService.login(
                request.getEmail(),
                request.getPassword()
        );

        return Map.of(
                "success", true,
                "token", token
        );
    }

    // 🔒 PROTECTED — Doctor Profile
    @GetMapping("/profile")
    public Map<String, Object> profile(Authentication authentication) {

        String doctorId = authentication.getPrincipal().toString();

        return Map.of(
                "success", true,
                "profile", doctorService.getProfile(doctorId)
        );
    }

    // 🔒 PROTECTED — Update Profile
    @PostMapping("/update-profile")
    public Map<String, Object> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, Object> payload
    ) {
        String doctorId = authentication.getPrincipal().toString();

        doctorService.updateProfile(doctorId, payload);

        return Map.of(
                "success", true,
                "message", "Profile Updated"
        );
    }

    // 🔒 REAL-TIME DASHBOARD
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(Authentication authentication) {

        String doctorId = authentication.getPrincipal().toString();

        return Map.of(
                "success", true,
                "dashboard", doctorService.getDashboard(doctorId)
        );
    }

    // ✅ GET AVAILABLE SLOTS
    @GetMapping("/slots")
    public Map<String, Object> getSlots(
            @RequestParam String doctorId,
            @RequestParam(defaultValue = "7") int days
    ) {
        return Map.of(
                "success", true,
                "slots", slotService.getAvailableSlots(doctorId, days)
        );
    }
}
