package com.prescripto.audit.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class AuditMetrics {

    private final Counter consumed;

    public AuditMetrics(MeterRegistry registry) {
        consumed = registry.counter("audit.events.consumed");
    }

    public void consumed() {
        consumed.increment();
    }
}
