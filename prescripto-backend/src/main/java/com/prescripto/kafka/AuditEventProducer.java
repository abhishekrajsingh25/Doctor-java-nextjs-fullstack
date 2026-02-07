package com.prescripto.kafka;

import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class AuditEventProducer {

    private static final String TOPIC = "prescripto.audit.events";

    private final KafkaTemplate<String, AuditEvent> kafkaTemplate;

    public AuditEventProducer(
            KafkaTemplate<String, AuditEvent> kafkaTemplate
    ) {
        this.kafkaTemplate = kafkaTemplate;
    }

    public void publish(AuditEvent event) {
        kafkaTemplate.send(TOPIC, event.getEntityId(), event);
    }
}

