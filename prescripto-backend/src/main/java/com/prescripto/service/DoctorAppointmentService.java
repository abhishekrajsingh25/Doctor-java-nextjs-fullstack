package com.prescripto.service;

import com.prescripto.events.NotificationEvent;
import com.prescripto.events.NotificationEventPublisher;
import com.prescripto.kafka.AuditEvent;
import com.prescripto.kafka.AuditEventProducer;
import com.prescripto.metrics.AppointmentMetrics;
import com.prescripto.model.Appointment;
import com.prescripto.model.Doctor;
import com.prescripto.redis.RedisKeys;
import com.prescripto.redis.RedisService;
import com.prescripto.repository.AppointmentRepository;
import com.prescripto.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class DoctorAppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final RedisService redisService;
    private final NotificationEventPublisher eventPublisher;
    private final AuditEventProducer auditProducer;
    private final AppointmentMetrics appointmentMetrics;

    public DoctorAppointmentService(
            AppointmentRepository appointmentRepository,
            DoctorRepository doctorRepository,
            RedisService redisService,
            NotificationEventPublisher eventPublisher,
            AuditEventProducer auditProducer,
            AppointmentMetrics appointmentMetrics
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.redisService = redisService;
        this.eventPublisher = eventPublisher;
        this.auditProducer = auditProducer;
        this.appointmentMetrics = appointmentMetrics;
    }

    // ✅ GET DOCTOR APPOINTMENTS
    public List<Appointment> getDoctorAppointments(String doctorId) {
        return appointmentRepository.findByDocId(doctorId);
    }

    // ✅ COMPLETE APPOINTMENT
    public void completeAppointment(String doctorId, String appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getDocId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized");
        }

        appointment.setCompleted(true);
        appointmentRepository.save(appointment);
    }

    // ✅ CANCEL APPOINTMENT (FREE SLOT)
    public void cancelAppointment(String doctorId, String appointmentId) {

        Appointment appointment = appointmentRepository
                .findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (!appointment.getDocId().equals(doctorId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Mark cancelled
        appointment.setCancelled(true);
        Appointment savedAppointment =
                appointmentRepository.save(appointment);


        // Release doctor slot
        Doctor doctor = doctorRepository.findById(doctorId)
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

        // 📊 METRIC — doctor cancelled
        appointmentMetrics.cancelled();

        // 🔴 INVALIDATE SLOT CACHE
        redisService.delete(
                RedisKeys.doctorSlots(
                        doctorId,
                        "7days"
                )
        );

        // 🔔 PUBLISH DOCTOR CANCELLATION EVENT
        NotificationEvent event = new NotificationEvent();
        event.setEventType("APPOINTMENT_CANCELLED");
        event.setEntityId(savedAppointment.getId());
        event.setUserId(savedAppointment.getUserId());
        event.setDoctorId(doctorId);
        event.setPayload(Map.of(
                "userEmail", savedAppointment.getUserData().get("email"),
                "userName", savedAppointment.getUserData().get("name"),
                "doctorName", savedAppointment.getDocData().get("name"),
                "slotDate", savedAppointment.getSlotDate(),
                "slotTime", savedAppointment.getSlotTime(),
                "cancelledBy", "DOCTOR"
        ));

        eventPublisher.publish(event);

        AuditEvent audit = new AuditEvent();
        audit.setEventType("APPOINTMENT_CANCELLED");
        audit.setEntityId(appointment.getId());
        audit.setUserId(appointment.getUserId());
        audit.setDoctorId(appointment.getDocId());
        audit.setPayload(Map.of(
                "cancelledBy", "DOCTOR",
                "slotDate", appointment.getSlotDate(),
                "slotTime", appointment.getSlotTime()
        ));

        auditProducer.publish(audit);

    }
}
