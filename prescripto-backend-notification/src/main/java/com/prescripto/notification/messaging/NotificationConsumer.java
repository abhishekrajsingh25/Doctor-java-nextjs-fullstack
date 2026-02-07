package com.prescripto.notification.messaging;

import com.prescripto.notification.config.RabbitMQConfig;
import com.prescripto.notification.email.EmailTemplates;
import com.prescripto.notification.metrics.NotificationMetrics;
import com.prescripto.notification.model.Notification;
import com.prescripto.notification.repository.NotificationRepository;
import com.prescripto.notification.service.EmailService;
import com.rabbitmq.client.Channel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
public class NotificationConsumer {

    private final NotificationRepository repo;
    private final EmailService emailService;
    private final NotificationMetrics notificationMetrics;


    public NotificationConsumer(
            NotificationRepository repo,
            EmailService emailService,
            NotificationMetrics notificationMetrics
    ) {
        this.repo = repo;
        this.emailService = emailService;
        this.notificationMetrics = notificationMetrics;
    }

    @RabbitListener(
            queues = RabbitMQConfig.QUEUE,
            containerFactory = "rabbitListenerContainerFactory"
    )
    public void consume(
            @Payload Map<String, Object> event,
            Channel channel,
            Message message
    ) throws Exception {

        Notification n = repo.save(toEntity(event));

        try {
            EmailTemplates.Email email = buildEmail(n);

            if (email != null) {
                emailService.send(
                        (String) n.getPayload().get("userEmail"),
                        email.subject(),
                        email.html()
                );
            }

            n.setStatus(Notification.Status.SENT);
            repo.save(n);

            // 📊 METRIC: notification sent
            notificationMetrics.sent();

            channel.basicAck(
                    message.getMessageProperties().getDeliveryTag(),
                    false
            );

        } catch (Exception ex) {
            log.error("❌ Email failed", ex);

            n.setStatus(Notification.Status.FAILED);
            repo.save(n);

            // 📊 METRIC: notification failed
            notificationMetrics.failed();

            channel.basicNack(
                    message.getMessageProperties().getDeliveryTag(),
                    false,
                    false // → DLQ
            );
        }
    }

    private EmailTemplates.Email buildEmail(Notification n) {
        return switch (n.getEventType()) {
            case "APPOINTMENT_BOOKED" ->
                    EmailTemplates.appointmentBooked(n.getPayload());
            case "APPOINTMENT_CANCELLED" ->
                    EmailTemplates.appointmentCancelled(n.getPayload());
            case "PAYMENT_SUCCESS" ->
                    EmailTemplates.paymentSuccess(n.getPayload());
            default -> null;
        };
    }

    @SuppressWarnings("unchecked")
    private Notification toEntity(Map<String, Object> e) {
        Notification n = new Notification();
        n.setEventType((String) e.get("eventType"));
        n.setEntityId((String) e.get("entityId"));
        n.setUserId((String) e.get("userId"));
        n.setDoctorId((String) e.get("doctorId"));
        n.setPayload((Map<String, Object>) e.get("payload"));
        return n;
    }
}
