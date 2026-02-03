package com.inventory.controller;

import com.inventory.dto.request.StockAdjustmentRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.StockAdjustment;
import com.inventory.service.AutoReorderService; // <-- Import
import com.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','INVENTORY_STAFF')")
public class InventoryController {

    private final InventoryService inventoryService;
    private final AutoReorderService autoReorderService; // <-- Inject

    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<StockAdjustment>> adjust(@Valid @RequestBody StockAdjustmentRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Stock adjusted", inventoryService.adjust(req)));
    }

    @GetMapping("/adjustments/{productId}")
    public ResponseEntity<ApiResponse<Page<StockAdjustment>>> history(
            @PathVariable Long productId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.history(productId, pageable)));
    }

    // --- NEW ENDPOINT ---
    @PostMapping("/bot/trigger")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> triggerBot() {
        autoReorderService.runManualCheck();
        return ResponseEntity.ok(ApiResponse.success("Auto-reorder check completed", null));
    }
}