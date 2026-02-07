package com.prescripto.audit.repository;

import com.prescripto.audit.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AuditRepository
        extends JpaRepository<AuditLog, UUID> {
}
