package com.prescripto.controller;

import com.prescripto.service.DoctorAppointmentService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/doctor")
public class DoctorAppointmentController {

    private final DoctorAppointmentService doctorAppointmentService;

    public DoctorAppointmentController(
            DoctorAppointmentService doctorAppointmentService
    ) {
        this.doctorAppointmentService = doctorAppointmentService;
    }

    // ✅ GET DOCTOR APPOINTMENTS
    @GetMapping("/appointments")
    public Map<String, Object> getAppointments(Authentication authentication) {

        String doctorId = authentication.getPrincipal().toString();

        return Map.of(
                "success", true,
                "appointments",
                doctorAppointmentService.getDoctorAppointments(doctorId)
        );
    }

    // ✅ COMPLETE APPOINTMENT
    @PostMapping("/complete-appointment")
    public Map<String, Object> completeAppointment(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        String doctorId = authentication.getPrincipal().toString();

        doctorAppointmentService.completeAppointment(
                doctorId,
                payload.get("appointmentId")
        );

        return Map.of(
                "success", true,
                "message", "Appointment Completed"
        );
    }

    // ✅ CANCEL APPOINTMENT
    @PostMapping("/cancel-appointment")
    public Map<String, Object> cancelAppointment(
            Authentication authentication,
            @RequestBody Map<String, String> payload
    ) {
        String doctorId = authentication.getPrincipal().toString();

        doctorAppointmentService.cancelAppointment(
                doctorId,
                payload.get("appointmentId")
        );

        return Map.of(
                "success", true,
                "message", "Appointment Cancelled"
        );
    }
}
