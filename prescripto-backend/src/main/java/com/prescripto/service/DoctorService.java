package com.prescripto.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prescripto.model.Doctor;
import com.prescripto.model.Appointment;
import com.prescripto.redis.RedisKeys;
import com.prescripto.redis.RedisService;
import com.prescripto.repository.AppointmentRepository;
import com.prescripto.repository.DoctorRepository;
import com.prescripto.security.JwtUtil;
import com.prescripto.util.PasswordUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DoctorService {

    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;
    private final JwtUtil jwtUtil;
    private final RedisService redisService;

    private final ObjectMapper mapper = new ObjectMapper();

    public DoctorService(
            DoctorRepository doctorRepository,
            AppointmentRepository appointmentRepository,
            JwtUtil jwtUtil,
            RedisService redisService
    ) {
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
        this.jwtUtil = jwtUtil;
        this.redisService = redisService;
    }

    // ✅ LOGIN
    public String login(String email, String password) {

        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email"));

        if (!PasswordUtil.match(password, doctor.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(doctor.getId());
    }

    // ✅ PUBLIC LIST
    public List<Doctor> listDoctors() {

        // 🔴 REDIS READ
        String cached = redisService.get(RedisKeys.DOCTORS_LIST);
        if (cached != null) {
            try {
                return mapper.readValue(
                        cached,
                        mapper.getTypeFactory()
                                .constructCollectionType(List.class, Doctor.class)
                );
            } catch (Exception ignored) {}
        }

        List<Doctor> doctors = doctorRepository.findAll()
                .stream()
                .map(this::sanitize)
                .toList();

        // 🔴 REDIS WRITE (5 min)
        try {
            redisService.set(
                    RedisKeys.DOCTORS_LIST,
                    mapper.writeValueAsString(doctors),
                    300
            );
        } catch (Exception ignored) {}

        return doctors;
    }

    // 🔒 PROFILE
    public Doctor getProfile(String doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return sanitize(doctor);
    }

    // 🔒 UPDATE PROFILE
    public void updateProfile(String doctorId, Map<String, Object> payload) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (payload.containsKey("fees"))
            doctor.setFees((Integer) payload.get("fees"));

        if (payload.containsKey("available"))
            doctor.setAvailable((Boolean) payload.get("available"));

        if (payload.containsKey("address"))
            doctor.setAddress((Map<String, Object>) payload.get("address"));

        // 🔹 UPDATE WORK START TIME
        if (payload.containsKey("workStartTime")) {
            doctor.setWorkStartTime(
                    LocalTime.parse(payload.get("workStartTime").toString())
            );
        }

        // 🔹 UPDATE WORK END TIME
        if (payload.containsKey("workEndTime")) {
            doctor.setWorkEndTime(
                    LocalTime.parse(payload.get("workEndTime").toString())
            );
        }

        // 🔹 UPDATE SLOT DURATION
        if (payload.containsKey("slotDuration")) {
            doctor.setSlotDuration(
                    (Integer) payload.get("slotDuration")
            );
        }

        doctorRepository.save(doctor);

        // 🔴 REDIS INVALIDATION
        redisService.delete(RedisKeys.DOCTORS_LIST);
        redisService.delete(RedisKeys.doctorDashboard(doctorId));
    }

    // 🔒 REAL-TIME DASHBOARD
    public Map<String, Object> getDashboard(String doctorId) {

        String key = RedisKeys.doctorDashboard(doctorId);

        // 🔴 REDIS READ
        String cached = redisService.get(key);
        if (cached != null) {
            try {
                return mapper.readValue(cached, Map.class);
            } catch (Exception ignored) {}
        }

        List<Appointment> appointments =
                appointmentRepository.findByDocId(doctorId);

        int totalAppointments = appointments.size();

        long patients = appointments.stream()
                .map(Appointment::getUserId)
                .distinct()
                .count();

        int earnings = appointments.stream()
                .filter(a -> a.isCompleted() || a.isPayment())
                .mapToInt(Appointment::getAmount)
                .sum();

        Map<String, Object> dashboard = Map.of(
                "appointments", totalAppointments,
                "patients", patients,
                "earnings", earnings
        );

        // 🔴 REDIS WRITE (60s)
        try {
            redisService.set(
                    key,
                    mapper.writeValueAsString(dashboard),
                    60
            );
        } catch (Exception ignored) {}

        return dashboard;
    }

    // 🔐 REMOVE PASSWORD
    private Doctor sanitize(Doctor doctor) {
        doctor.setPassword(null);
        return doctor;
    }

    // ✅ DYNAMIC SLOT GENERATION (MATCHES YOUR OLD FRONTEND LOGIC)
    public List<List<Map<String, Object>>> getDoctorSlots(String doctorId) {

        String cacheKey = RedisKeys.doctorSlots(doctorId, "7days");

        // 🔴 REDIS READ
        String cached = redisService.get(cacheKey);
        if (cached != null) {
            try {
                return mapper.readValue(cached, List.class);
            } catch (Exception ignored) {}
        }

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<List<Map<String, Object>>> docSlots = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < 7; i++) {

            LocalDate currentDate = today.plusDays(i);
            LocalTime startTime;
            LocalTime endTime = LocalTime.of(21, 0);

            if (i == 0) {
                LocalTime now = LocalTime.now();
                int hour = now.getHour() >= 10 ? now.getHour() + 1 : 10;
                int minute = now.getMinute() > 30 ? 30 : 0;
                startTime = LocalTime.of(hour, minute);
            } else {
                startTime = LocalTime.of(10, 0);
            }

            List<Map<String, Object>> timeSlots = new ArrayList<>();

            while (startTime.isBefore(endTime)) {

                String slotTime = formatTime(startTime);

                String slotDate =
                        currentDate.getDayOfMonth() + "_" +
                                currentDate.getMonthValue() + "_" +
                                currentDate.getYear();

                boolean isBooked =
                        doctor.getSlotsBooked().containsKey(slotDate)
                                && doctor.getSlotsBooked()
                                .get(slotDate)
                                .contains(slotTime);

                if (!isBooked) {
                    timeSlots.add(
                            Map.of(
                                    "time", slotTime,
                                    "datetime", LocalDateTime.of(currentDate, startTime)
                            )
                    );
                }

                startTime = startTime.plusMinutes(30);
            }

            docSlots.add(timeSlots);
        }

        // 🔴 REDIS WRITE (30s – slots change fast)
        try {
            redisService.set(
                    cacheKey,
                    mapper.writeValueAsString(docSlots),
                    30
            );
        } catch (Exception ignored) {}

        return docSlots;
    }

    // ✅ FORMAT TIME LIKE "10:30"
    private String formatTime(LocalTime time) {
        return String.format(
                "%02d:%02d",
                time.getHour(),
                time.getMinute()
        );
    }
}
