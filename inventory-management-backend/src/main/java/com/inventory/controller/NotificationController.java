package com.inventory.controller;

import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.Notification;
import com.inventory.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Notification>>> myNotifications(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(notificationService.myNotifications(pageable)));
    }

    @GetMapping("/unread")
    public ResponseEntity<ApiResponse<List<Notification>>> myUnread() {
        return ResponseEntity.ok(ApiResponse.success(notificationService.myUnread()));
    }

    @GetMapping("/unread/count")
    public ResponseEntity<ApiResponse<Map<String, Integer>>> myUnreadCount() {
        return ResponseEntity.ok(ApiResponse.success(Map.of("count", notificationService.myUnreadCount())));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markRead(@PathVariable Long id) {
        notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.success("Marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllRead() {
        notificationService.markAllRead();
        return ResponseEntity.ok(ApiResponse.success("All marked as read", null));
    }
}