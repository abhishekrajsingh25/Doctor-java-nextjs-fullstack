package com.prescripto.controller;

import com.prescripto.service.PaymentService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // CREATE ORDER
    @PostMapping("/payment-razorpay")
    public Map<String, Object> createOrder(
            @RequestBody Map<String, String> payload
    ) throws Exception {

        return Map.of(
                "success", true,
                "order",
                paymentService.createOrder(payload.get("appointmentId"))
        );
    }

    // VERIFY PAYMENT
    @PostMapping("/verify-razorpay")
    public Map<String, Object> verifyPayment(
            @RequestBody Map<String, String> payload
    ) {
        paymentService.verifyPayment(
                payload.get("razorpay_order_id"),
                payload.get("razorpay_payment_id"),
                payload.get("razorpay_signature"),
                payload.get("appointmentId")
        );

        return Map.of(
                "success", true,
                "message", "Payment Successful"
        );
    }
}

