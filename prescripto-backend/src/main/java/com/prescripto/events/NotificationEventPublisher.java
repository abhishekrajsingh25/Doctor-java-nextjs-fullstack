package com.prescripto.events;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(NotificationEvent event) {
        try {
            rabbitTemplate.convertAndSend(
                    "notification.exchange",
                    "notification.routing.key",
                    event
            );
        } catch (Exception e) {
            log.warn("Notification publish failed", e);
        }
    }
}
