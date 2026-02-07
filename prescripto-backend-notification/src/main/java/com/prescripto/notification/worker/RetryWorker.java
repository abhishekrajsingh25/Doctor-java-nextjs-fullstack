package com.prescripto.notification.worker;

import com.prescripto.notification.model.Notification;
import com.prescripto.notification.repository.NotificationRepository;
import com.prescripto.notification.service.EmailService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class RetryWorker {

    private static final int MAX_RETRIES = 10;
    private final NotificationRepository repo;
    private final EmailService emailService;

    public RetryWorker(NotificationRepository repo, EmailService emailService) {
        this.repo = repo;
        this.emailService = emailService;
    }

    @Scheduled(fixedDelay = 60000)
    public void retryFailed() {
        repo.findByStatusAndRetryCountLessThan(
                Notification.Status.FAILED,
                MAX_RETRIES
        ).forEach(n -> {
            try {
                emailService.send(
                        (String) n.getPayload().get("userEmail"),
                        "Retry Notification",
                        "Retrying email..."
                );
                n.setStatus(Notification.Status.SENT);
            } catch (Exception e) {
                n.setRetryCount(n.getRetryCount() + 1);
            }
            repo.save(n);
        });
    }
}
