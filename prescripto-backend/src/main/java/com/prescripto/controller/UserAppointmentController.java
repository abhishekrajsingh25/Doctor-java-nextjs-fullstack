package com.prescripto.controller;

import com.prescripto.security.CustomUserDetails;
import com.prescripto.service.AppointmentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserAppointmentController {

    private final AppointmentService appointmentService;

    public UserAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    // ✅ Book Appointment
    @PostMapping("/book-appointment")
    public Map<String, Object> bookAppointment(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        String userId = userDetails.getUserId();

        appointmentService.bookAppointment(
                userId,
                payload.get("docId"),
                payload.get("slotDate"),
                payload.get("slotTime")
        );

        return Map.of(
                "success", true,
                "message", "Appointment Booked"
        );
    }

    // ✅ List User Appointments (FIXED)
    @GetMapping("/appointments")
    public Map<String, Object> listAppointments(Authentication authentication) {

        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        String userId = userDetails.getUserId();

        return Map.of(
                "success", true,
                "appointments", appointmentService.getUserAppointments(userId)
        );
    }

    // ✅ Cancel Appointment (FIXED)
    @PostMapping("/cancel-appointment")
    public Map<String, Object> cancelAppointment(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        CustomUserDetails userDetails =
                (CustomUserDetails) authentication.getPrincipal();

        String userId = userDetails.getUserId();

        appointmentService.cancelAppointment(
                userId,
                payload.get("appointmentId")
        );

        return Map.of(
                "success", true,
                "message", "Appointment Cancelled"
        );
    }
}