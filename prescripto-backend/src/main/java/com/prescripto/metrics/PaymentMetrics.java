package com.prescripto.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class PaymentMetrics {

    private final Counter success;

    public PaymentMetrics(MeterRegistry registry) {
        success = registry.counter("payments.success");
    }

    public void success() {
        success.increment();
    }
}
