package com.prescripto.notification.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;
import java.util.Map;

@Data
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String eventType;
    private String entityId;
    private String userId;
    private String doctorId;
    private Map<String, Object> payload;

    private Status status = Status.RECEIVED;
    private int retryCount = 0;
    private Date createdAt = new Date();

    public enum Status {
        RECEIVED,
        SENT,
        FAILED
    }
}
