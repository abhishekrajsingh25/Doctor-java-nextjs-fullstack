package com.prescripto.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prescripto.dto.AddDoctorRequest;
import com.prescripto.events.NotificationEvent;
import com.prescripto.events.NotificationEventPublisher;
import com.prescripto.kafka.AuditEvent;
import com.prescripto.kafka.AuditEventProducer;
import com.prescripto.metrics.AppointmentMetrics;
import com.prescripto.model.Doctor;
import com.prescripto.redis.RedisKeys;
import com.prescripto.redis.RedisService;
import com.prescripto.repository.DoctorRepository;
import com.prescripto.security.JwtUtil;
import com.prescripto.util.PasswordUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.prescripto.model.Appointment;
import com.prescripto.repository.AppointmentRepository;
import com.prescripto.repository.UserRepository;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final DoctorRepository doctorRepository;
    private final JwtUtil jwtUtil;
    private final CloudinaryService cloudinaryService;
    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final RedisService redisService;
    private final NotificationEventPublisher eventPublisher;
    private final AuditEventProducer auditProducer;
    private final ObjectMapper mapper = new ObjectMapper();
    private final AppointmentMetrics appointmentMetrics;

    @Value("${admin.email}")
    private String adminEmail;

    @Value("${admin.password}")
    private String adminPassword;

    public AdminService(
            DoctorRepository doctorRepository,
            JwtUtil jwtUtil,
            CloudinaryService cloudinaryService,
            AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            RedisService redisService,
            NotificationEventPublisher eventPublisher,
            AuditEventProducer auditProducer,
            AppointmentMetrics appointmentMetrics
    ) {
        this.doctorRepository = doctorRepository;
        this.jwtUtil = jwtUtil;
        this.cloudinaryService = cloudinaryService;
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.redisService = redisService;
        this.eventPublisher = eventPublisher;
        this.auditProducer = auditProducer;
        this.appointmentMetrics = appointmentMetrics;
    }

    // ADMIN LOGIN
    public String login(String email, String password) {

        if (!adminEmail.equals(email) || !adminPassword.equals(password)) {
            throw new RuntimeException("Invalid admin credentials");
        }

        return jwtUtil.generateToken(adminEmail + adminPassword);
    }

    // ADD DOCTOR
    public Doctor addDoctor(AddDoctorRequest req, MultipartFile image) throws Exception {

        if (doctorRepository.findByEmail(req.getEmail()).isPresent()) {
            throw new RuntimeException("Doctor already exists");
        }

        String imageUrl =
                cloudinaryService.upload(image, "prescripto/doctors");

        Map<String, Object> address =
                mapper.readValue(req.getAddress(), new TypeReference<>() {});

        Doctor doctor = new Doctor();
        doctor.setName(req.getName());
        doctor.setEmail(req.getEmail());
        doctor.setPassword(PasswordUtil.hash(req.getPassword()));
        doctor.setImage(imageUrl);
        doctor.setSpeciality(req.getSpeciality());
        doctor.setDegree(req.getDegree());
        doctor.setExperience(req.getExperience());
        doctor.setAbout(req.getAbout());
        doctor.setFees(req.getFees());
        doctor.setAddress(address);
        doctor.setAvailable(true);
        doctor.setDate(Instant.now().toEpochMilli());

        Doctor saved = doctorRepository.save(doctor);

        // 🔴 REDIS INVALIDATION
        redisService.delete(RedisKeys.ADMIN_DASHBOARD);
        redisService.delete(RedisKeys.DOCTORS_LIST);

        return saved;
    }

    // ALL DOCTORS
    public List<Doctor> allDoctors() {
        return doctorRepository.findAll();
    }

    // CHANGE AVAILABILITY
    public void changeAvailability(String doctorId) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        doctor.setAvailable(!doctor.isAvailable());
        doctorRepository.save(doctor);

    }

    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }

    public void cancelAppointment(String appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appointment.setCancelled(true);
        Appointment savedAppointment =
                appointmentRepository.save(appointment);

        // Release doctor slot
        Doctor doctor = doctorRepository.findById(appointment.getDocId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Map<String, List<String>> slotsBooked = doctor.getSlotsBooked();

        List<String> daySlots = slotsBooked.get(appointment.getSlotDate());

        if (daySlots != null) {
            daySlots.remove(appointment.getSlotTime());

            if (daySlots.isEmpty()) {
                slotsBooked.remove(appointment.getSlotDate());
            }
        }

        doctorRepository.save(doctor);

        // 🔴 REDIS INVALIDATION
        redisService.delete(RedisKeys.ADMIN_DASHBOARD);
        redisService.delete(
                RedisKeys.doctorSlots(
                        appointment.getDocId(),
                        appointment.getSlotDate()
                )
        );

        // 📊 METRIC — doctor cancelled
        appointmentMetrics.cancelled();

        // 🔔 PUBLISH ADMIN CANCELLATION EVENT
        NotificationEvent event = new NotificationEvent();
        event.setEventType("APPOINTMENT_CANCELLED");
        event.setEntityId(savedAppointment.getId());
        event.setUserId(savedAppointment.getUserId());
        event.setDoctorId(savedAppointment.getDocId());
        event.setPayload(Map.of(
                "userEmail", savedAppointment.getUserData().get("email"),
                "userName", savedAppointment.getUserData().get("name"),
                "doctorName", savedAppointment.getDocData().get("name"),
                "slotDate", savedAppointment.getSlotDate(),
                "slotTime", savedAppointment.getSlotTime(),
                "cancelledBy", "ADMIN"
        ));

        eventPublisher.publish(event);

        AuditEvent audit = new AuditEvent();
        audit.setEventType("APPOINTMENT_CANCELLED");
        audit.setEntityId(appointment.getId());
        audit.setUserId(appointment.getUserId());
        audit.setDoctorId(appointment.getDocId());
        audit.setPayload(Map.of(
                "cancelledBy", "ADMIN",
                "slotDate", appointment.getSlotDate(),
                "slotTime", appointment.getSlotTime()
        ));

        auditProducer.publish(audit);

    }

    public Map<String, Object> getDashboard() throws Exception {

        String cacheKey = RedisKeys.ADMIN_DASHBOARD;

        // 🔴 REDIS READ
        String cached = redisService.get(cacheKey);
        if (cached != null) {
            return mapper.readValue(cached, Map.class);
        }

        List<Doctor> doctors = doctorRepository.findAll();
        List<?> users = userRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();

        List<Appointment> latestAppointments = appointments.stream()
                .sorted((a, b) -> Long.compare(b.getDate(), a.getDate()))
                .limit(5)
                .toList();

        Map<String, Object> dashboard = Map.of(
                "doctors", doctors.size(),
                "patients", users.size(),
                "appointments", appointments.size(),
                "latestAppointments", latestAppointments
        );

        // 🔴 REDIS WRITE (60s)
        redisService.set(
                cacheKey,
                mapper.writeValueAsString(dashboard),
                60
        );

        return dashboard;
    }

}
