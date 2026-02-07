package com.prescripto.service;

import com.prescripto.events.NotificationEvent;
import com.prescripto.events.NotificationEventPublisher;
import com.prescripto.kafka.AuditEvent;
import com.prescripto.kafka.AuditEventProducer;
import com.prescripto.metrics.AppointmentMetrics;
import com.prescripto.model.Appointment;
import com.prescripto.model.Doctor;
import com.prescripto.model.User;
import com.prescripto.redis.RedisKeys;
import com.prescripto.redis.RedisService;
import com.prescripto.repository.AppointmentRepository;
import com.prescripto.repository.DoctorRepository;
import com.prescripto.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final RedisService redisService;
    private final UserRepository userRepository;
    private final NotificationEventPublisher eventPublisher;
    private final AuditEventProducer auditProducer;
    private final AppointmentMetrics appointmentMetrics;

    public AppointmentService(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            RedisService redisService, UserRepository userRepository,
            NotificationEventPublisher eventPublisher,
            AuditEventProducer auditProducer,
            AppointmentMetrics appointmentMetrics
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.redisService = redisService;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
        this.auditProducer = auditProducer;
        this.appointmentMetrics = appointmentMetrics;
    }

    // ✅ BOOK APPOINTMENT
    public void bookAppointment(
            String userId,
            String docId,
            String slotDate,
            String slotTime
    ) {

        String lockKey =
                "lock:doctor:" + docId + ":" + slotDate + ":" + slotTime;

        boolean locked = redisService.acquireLock(lockKey, 10);

        if (!locked) {
            throw new RuntimeException("Slot is being booked, try again");
        }

        try {
            // =========================
            // 1️⃣ BUSINESS LOGIC (NO CATCH)
            // =========================

            Doctor doctor = doctorRepository.findById(docId)
                    .orElseThrow(() -> new RuntimeException("Doctor not found"));

            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (!doctor.isAvailable()) {
                throw new RuntimeException("Doctor not available");
            }

            Map<String, List<String>> slotsBooked = doctor.getSlotsBooked();

            if (slotsBooked.containsKey(slotDate)
                    && slotsBooked.get(slotDate).contains(slotTime)) {
                throw new RuntimeException("Slot not available");
            }

            slotsBooked
                    .computeIfAbsent(slotDate, k -> new ArrayList<>())
                    .add(slotTime);

            Appointment appointment = new Appointment();
            appointment.setUserId(userId);
            appointment.setDocId(docId);
            appointment.setSlotDate(slotDate);
            appointment.setSlotTime(slotTime);
            appointment.setAmount(doctor.getFees());
            appointment.setDate(System.currentTimeMillis());
            appointment.setCancelled(false);
            appointment.setPayment(false);
            appointment.setCompleted(false);

            appointment.setUserData(Map.of(
                    "userId", userId,
                    "email", user.getEmail(),
                    "name", user.getName()
            ));

            appointment.setDocData(Map.of(
                    "name", doctor.getName(),
                    "speciality", doctor.getSpeciality(),
                    "fees", doctor.getFees()
            ));

            Appointment savedAppointment =
                    appointmentRepository.save(appointment);

            doctorRepository.save(doctor);

            // ✅ METRIC: appointment booked
            appointmentMetrics.booked();

            try {
                NotificationEvent event = new NotificationEvent();
                event.setEventType("APPOINTMENT_BOOKED");
                event.setEntityId(savedAppointment.getId());
                event.setUserId(userId);
                event.setDoctorId(docId);
                event.setPayload(Map.of(
                        "userEmail", user.getEmail(),
                        "userName", user.getName(),
                        "doctorName", doctor.getName(),
                        "slotDate", slotDate,
                        "slotTime", slotTime,
                        "amount", doctor.getFees()
                ));

                eventPublisher.publish(event);

            } catch (Exception ex) {
                log.warn("⚠️ Notification publish failed", ex);
            }

            AuditEvent audit = new AuditEvent();
            audit.setEventType("APPOINTMENT_BOOKED");
            audit.setEntityId(savedAppointment.getId());
            audit.setUserId(userId);
            audit.setDoctorId(docId);
            audit.setPayload(Map.of(
                    "slotDate", slotDate,
                    "slotTime", slotTime,
                    "amount", doctor.getFees()
            ));

            auditProducer.publish(audit);


        } finally {
            redisService.releaseLock(lockKey);
        }
    }


    // ✅ GET USER APPOINTMENTS
    public List<Map<String, Object>> getUserAppointments(String userId) {
        return appointmentRepository.findByUserId(userId)
                .stream()
                .map(a -> {
                    String status =
                            a.isCancelled() ? "CANCELLED" :
                                    a.isCompleted() ? "COMPLETED" :
                                            "BOOKED";

                    return Map.of(
                            "id", a.getId(),
                            "doctorName", a.getDocData().get("name"),
                            "speciality", a.getDocData().get("speciality"),
                            "slotDate", a.getSlotDate(),
                            "slotTime", a.getSlotTime(),
                            "amount", a.getAmount(),
                            "status", status,
                            "payment", a.isPayment(),
                            "createdAt", a.getDate()
                    );
                }).toList();
    }

    // ✅ CANCEL APPOINTMENT (SLOT IS FREED)
    public void cancelAppointment(String userId, String appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Mark appointment cancelled
        appointment.setCancelled(true);
        appointmentRepository.save(appointment);

        // Release doctor slot
        Doctor doctor = doctorRepository.findById(appointment.getDocId())
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Map<String, List<String>> slotsBooked = doctor.getSlotsBooked();

        List<String> daySlots = slotsBooked.get(appointment.getSlotDate());

        if (daySlots != null) {
            daySlots.remove(appointment.getSlotTime());

            // Clean empty date entry
            if (daySlots.isEmpty()) {
                slotsBooked.remove(appointment.getSlotDate());
            }
        }

        doctorRepository.save(doctor);

        // 🔴 INVALIDATE SLOT CACHE
        redisService.delete(
                RedisKeys.doctorSlots(
                        appointment.getDocId(),
                        "7days"
                )
        );

        // ✅ METRIC: appointment cancelled
        appointmentMetrics.cancelled();

        // 🔔 PUBLISH CANCELLATION EVENT (NEW)
        NotificationEvent event = new NotificationEvent();
        event.setEventType("APPOINTMENT_CANCELLED");
        event.setEntityId(appointment.getId());
        event.setUserId(userId);
        event.setDoctorId(appointment.getDocId());
        event.setPayload(Map.of(
                "userEmail", appointment.getUserData().get("email"),
                "userName", appointment.getUserData().get("name"),
                "doctorName", appointment.getDocData().get("name"),
                "slotDate", appointment.getSlotDate(),
                "slotTime", appointment.getSlotTime(),
                "cancelledBy", "USER"
        ));

        eventPublisher.publish(event);

        AuditEvent audit = new AuditEvent();
        audit.setEventType("APPOINTMENT_CANCELLED");
        audit.setEntityId(appointment.getId());
        audit.setUserId(userId);
        audit.setDoctorId(appointment.getDocId());
        audit.setPayload(Map.of(
                "cancelledBy", "USER",
                "slotDate", appointment.getSlotDate(),
                "slotTime", appointment.getSlotTime()
        ));

        auditProducer.publish(audit);

    }
}
