package com.prescripto.notification.messaging;

import lombok.Data;
import java.util.Map;

@Data
public class NotificationEvent {

    private String eventType;
    private String entityId;
    private String userId;
    private String doctorId;
    private Map<String, Object> payload;
}
