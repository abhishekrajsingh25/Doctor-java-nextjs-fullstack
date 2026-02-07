package com.prescripto.audit.model;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Data
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    private UUID id = UUID.randomUUID();

    private String eventType;
    private String entityId;
    private String userId;
    private String doctorId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> payload;

    private Instant createdAt = Instant.now();
}
