package com.prescripto.notification.email;

import java.util.Map;

public class EmailTemplates {

    public static Email appointmentBooked(Map<String, Object> p) {
        return new Email(
                "Appointment Confirmed",
                """
                <h2>Appointment Confirmed ✅</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Your appointment with <b>%s</b> is confirmed.</p>
                <p><b>Date:</b> %s<br/><b>Time:</b> %s</p>
                """.formatted(
                        p.get("userName"),
                        p.get("doctorName"),
                        p.get("slotDate"),
                        p.get("slotTime")
                )
        );
    }

    public static Email appointmentCancelled(Map<String, Object> p) {
        return new Email(
                "Appointment Cancelled",
                """
                <h2>Appointment Cancelled ❌</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Your appointment with <b>%s</b> has been cancelled.</p>
                <p><b>Date:</b> %s<br/><b>Time:</b> %s</p>
                <p><b>Cancelled by:</b> %s</p>
                """.formatted(
                        p.get("userName"),
                        p.get("doctorName"),
                        p.get("slotDate"),
                        p.get("slotTime"),
                        p.get("cancelledBy")
                )
        );
    }

    public static Email paymentSuccess(Map<String, Object> p) {
        return new Email(
                "Payment Successful",
                """
                <h2>Payment Successful 💳</h2>
                <p>Hello <b>%s</b>,</p>
                <p>Payment for appointment with <b>%s</b> successful.</p>
                <p><b>Date:</b> %s<br/><b>Time:</b> %s<br/><b>Amount:</b> ₹%s</p>
                """.formatted(
                        p.get("userName"),
                        p.get("doctorName"),
                        p.get("slotDate"),
                        p.get("slotTime"),
                        p.get("amount")
                )
        );
    }

    public record Email(String subject, String html) {}
}
