package com.prescripto.service;

import com.prescripto.events.NotificationEvent;
import com.prescripto.events.NotificationEventPublisher;
import com.prescripto.model.Appointment;
import com.prescripto.repository.AppointmentRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class PaymentService {

    private final AppointmentRepository appointmentRepository;
    private final RazorpayClient razorpayClient;
    private final NotificationEventPublisher eventPublisher;

    public PaymentService(
            AppointmentRepository appointmentRepository,
            RazorpayClient razorpayClient,
            NotificationEventPublisher eventPublisher
    ) {
        this.appointmentRepository = appointmentRepository;
        this.razorpayClient = razorpayClient;
        this.eventPublisher = eventPublisher;
    }

    // CREATE ORDER
    public Map<String, Object> createOrder(String appointmentId) throws Exception {

        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        if (appt.isCancelled()) {
            throw new RuntimeException("Appointment cancelled");
        }

        JSONObject options = new JSONObject();
        options.put("amount", appt.getAmount() * 100); // INR paise
        options.put("currency", "INR");
        options.put("receipt", appointmentId);

        Order order = razorpayClient.orders.create(options);

        return Map.of(
                "orderId", order.get("id"),
                "amount", order.get("amount"),
                "currency", order.get("currency")
        );
    }

    // VERIFY PAYMENT
    public void verifyPayment(
            String orderId,
            String paymentId,
            String signature,
            String appointmentId
    ) {

        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));

        appt.setPayment(true);
        Appointment savedAppointment = appointmentRepository.save(appt);

        // 🔔 PUBLISH PAYMENT SUCCESS EVENT
        NotificationEvent event = new NotificationEvent();
        event.setEventType("PAYMENT_SUCCESS");
        event.setEntityId(savedAppointment.getId());
        event.setUserId(savedAppointment.getUserId());
        event.setDoctorId(savedAppointment.getDocId());
        event.setPayload(Map.of(
                "userEmail", savedAppointment.getUserData().get("email"),
                "userName", savedAppointment.getUserData().get("name"),
                "doctorName", savedAppointment.getDocData().get("name"),
                "slotDate", savedAppointment.getSlotDate(),
                "slotTime", savedAppointment.getSlotTime(),
                "amount", savedAppointment.getAmount()
        ));

        eventPublisher.publish(event);
    }
}

