package com.inventory.service;

import com.inventory.entity.Notification;
import com.inventory.entity.User;
import com.inventory.repository.NotificationRepository;
import com.inventory.repository.UserRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notifications;
    private final UserRepository users;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public Page<Notification> myNotifications(Pageable pageable) {
        User me = securityUtils.getCurrentUser();
        return notifications.findByUserId(me.getId(), pageable);
    }

    @Transactional(readOnly = true)
    public List<Notification> myUnread() {
        User me = securityUtils.getCurrentUser();
        return notifications.findUnreadByUserId(me.getId());
    }

    @Transactional(readOnly = true)
    public Integer myUnreadCount() {
        User me = securityUtils.getCurrentUser();
        Integer c = notifications.countUnreadByUserId(me.getId());
        return c == null ? 0 : c;
    }

    @Transactional
    public void markRead(Long id) {
        notifications.markAsRead(id);
    }

    @Transactional
    public void markAllRead() {
        User me = securityUtils.getCurrentUser();
        notifications.markAllAsRead(me.getId());
    }

    /**
     * Creates a notification for all active ADMIN users.
     * Runs in a new transaction so it doesn't fail the caller if something goes wrong.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void notifyAdmins(Notification.NotificationType type, String title, String message,
                             String referenceType, Long referenceId) {
        try {
            List<User> admins = users.findByRoleName("ADMIN");
            if (admins.isEmpty()) {
                log.warn("No ADMIN users found to notify: {}", title);
                return;
            }

            for (User admin : admins) {
                Notification n = Notification.builder()
                        .user(admin)
                        .type(type)
                        .title(title)
                        .message(message)
                        .referenceType(referenceType)
                        .referenceId(referenceId)
                        .isRead(false)
                        .build();
                notifications.save(n);
            }
        } catch (Exception e) {
            log.error("Failed to send notification: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public void lowStock(Long productId, String sku, String productName, int currentStock, int reorderPoint) {
        notifyAdmins(
                Notification.NotificationType.LOW_STOCK,
                "Low Stock Alert: " + productName,
                String.format("Product \"%s\" (SKU: %s) is below reorder point. Current: %d, Reorder point: %d",
                        productName, sku, currentStock, reorderPoint),
                "PRODUCT",
                productId
        );
    }
}