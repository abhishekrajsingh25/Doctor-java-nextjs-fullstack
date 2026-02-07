package com.prescripto.audit.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prescripto.audit.metrics.AuditMetrics;
import com.prescripto.audit.model.AuditLog;
import com.prescripto.audit.repository.AuditRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class AuditConsumer {

    private final AuditRepository repository;
    private final AuditMetrics auditMetrics;


    public AuditConsumer(AuditRepository repository, AuditMetrics auditMetrics) {
        this.repository = repository;
        this.auditMetrics = auditMetrics;
    }

    @KafkaListener(
            topics = "prescripto.audit.events",
            groupId = "audit-service"
    )
    public void consume(AuditEvent event) {

        try {
            AuditLog log = new AuditLog();
            log.setEventType(event.getEventType());
            log.setEntityId(event.getEntityId());
            log.setUserId(event.getUserId());
            log.setDoctorId(event.getDoctorId());
            log.setPayload(event.getPayload());

            repository.save(log);

            // 📊 METRIC: audit event consumed
            auditMetrics.consumed();

        } catch (Exception e) {
            log.error("Audit consume failed", e);
        }
    }
}


