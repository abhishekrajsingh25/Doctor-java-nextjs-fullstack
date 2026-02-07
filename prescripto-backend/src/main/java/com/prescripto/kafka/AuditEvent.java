package com.prescripto.kafka;

import lombok.Data;
import java.util.Map;

@Data
public class AuditEvent {

    private String eventType;
    private String entityId;
    private String userId;
    private String doctorId;
    private Map<String, Object> payload;
    private long timestamp = System.currentTimeMillis();
}
