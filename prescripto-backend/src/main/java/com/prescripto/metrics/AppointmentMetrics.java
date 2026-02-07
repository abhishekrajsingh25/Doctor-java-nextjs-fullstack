package com.prescripto.metrics;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

@Component
public class AppointmentMetrics {

    private final Counter booked;
    private final Counter cancelled;
    private final Timer bookingTime;

    public AppointmentMetrics(MeterRegistry registry) {
        booked = registry.counter("appointments.booked");
        cancelled = registry.counter("appointments.cancelled");
        bookingTime = registry.timer("appointments.booking.time");
    }

    public void booked() {
        booked.increment();
    }

    public void cancelled() {
        cancelled.increment();
    }

    public void recordBooking(Runnable r) {
        bookingTime.record(r);
    }
}
