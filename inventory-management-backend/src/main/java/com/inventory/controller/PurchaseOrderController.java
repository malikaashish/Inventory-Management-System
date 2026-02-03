package com.inventory.controller;

import com.inventory.dto.request.PurchaseOrderReceiveItemRequest;
import com.inventory.dto.request.PurchaseOrderRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.dto.response.PurchaseOrderResponse;
import com.inventory.service.PurchaseOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/purchases")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','INVENTORY_STAFF')")
public class PurchaseOrderController {

    private final PurchaseOrderService purchaseOrderService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<PurchaseOrderResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        Page<PurchaseOrderResponse> page = purchaseOrderService.list(pageable).map(PurchaseOrderResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(PurchaseOrderResponse.fromEntity(purchaseOrderService.get(id))));
    }

    @GetMapping("/orders/pending")
    public ResponseEntity<ApiResponse<List<PurchaseOrderResponse>>> pending() {
        List<PurchaseOrderResponse> list = purchaseOrderService.pending().stream()
                .map(PurchaseOrderResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> create(@Valid @RequestBody PurchaseOrderRequest req) {
        PurchaseOrderResponse created = PurchaseOrderResponse.fromEntity(purchaseOrderService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Purchase order created", created));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam com.inventory.entity.PurchaseOrder.PurchaseOrderStatus status
    ) {
        PurchaseOrderResponse updated = PurchaseOrderResponse.fromEntity(purchaseOrderService.updateStatus(id, status));
        return ResponseEntity.ok(ApiResponse.success("Status updated", updated));
    }

    @PostMapping("/orders/{id}/receive")
    public ResponseEntity<ApiResponse<PurchaseOrderResponse>> receive(
            @PathVariable Long id,
            @RequestBody List<PurchaseOrderReceiveItemRequest> items
    ) {
        PurchaseOrderResponse updated = PurchaseOrderResponse.fromEntity(purchaseOrderService.receive(id, items));
        return ResponseEntity.ok(ApiResponse.success("Items received", updated));
    }
}