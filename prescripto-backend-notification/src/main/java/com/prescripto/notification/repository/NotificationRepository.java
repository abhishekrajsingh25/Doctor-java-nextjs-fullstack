package com.prescripto.notification.repository;

import com.prescripto.notification.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository
        extends MongoRepository<Notification, String> {

    List<Notification> findByStatusAndRetryCountLessThan(
            Notification.Status status,
            int retryCount
    );
}
