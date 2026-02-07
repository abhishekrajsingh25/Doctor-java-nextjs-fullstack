package com.prescripto.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prescripto.dto.AddDoctorRequest;
import com.prescripto.dto.AdminLoginRequest;
import com.prescripto.model.Doctor;
import com.prescripto.service.AdminService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "AdminAuth")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody AdminLoginRequest request) {
        return Map.of(
                "success", true,
                "token", adminService.login(
                        request.getEmail(),
                        request.getPassword()
                )
        );
    }

    // ADD DOCTOR
    @PostMapping(
            value = "/add-doctor",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> addDoctor(
            @RequestPart("image") MultipartFile image,
            @RequestPart("data") String data
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        AddDoctorRequest request =
                mapper.readValue(data, AddDoctorRequest.class);

        Doctor doctor = adminService.addDoctor(request, image);

        return Map.of(
                "success", true,
                "doctor", doctor
        );
    }

    // ALL DOCTORS
    @GetMapping("/all-doctors")
    public Map<String, Object> allDoctors() {
        List<Doctor> doctors = adminService.allDoctors();
        return Map.of("success", true, "doctors", doctors);
    }

    // CHANGE AVAILABILITY
    @PostMapping("/change-availability")
    public Map<String, Object> changeAvailability(
            @RequestParam String doctorId
    ) {
        adminService.changeAvailability(doctorId);
        return Map.of("success", true);
    }

    // ================= ADMIN APPOINTMENTS =================

    // GET ALL APPOINTMENTS
    @GetMapping("/appointments")
    public Map<String, Object> appointments() {
        return Map.of(
                "success", true,
                "appointments", adminService.getAllAppointments()
        );
    }

    // CANCEL APPOINTMENT (ADMIN)
    @PostMapping("/cancel-appointment")
    public Map<String, Object> cancelAppointment(
            @RequestBody Map<String, String> payload
    ) {
        adminService.cancelAppointment(payload.get("appointmentId"));

        return Map.of(
                "success", true,
                "message", "Appointment Cancelled"
        );
    }

    // ADMIN DASHBOARD
    @GetMapping("/dashboard")
    public Map<String, Object> dashboard() throws Exception {
        return Map.of(
                "success", true,
                "dashboard", adminService.getDashboard()
        );
    }

}
