package com.prescripto.notification.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class NotificationMetrics {

    private final Counter sent;
    private final Counter failed;

    public NotificationMetrics(MeterRegistry registry) {
        sent = registry.counter("notifications.sent");
        failed = registry.counter("notifications.failed");
    }

    public void sent() {
        sent.increment();
    }

    public void failed() {
        failed.increment();
    }
}
