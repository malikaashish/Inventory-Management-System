package com.inventory.controller;

import com.inventory.dto.request.SalesOrderRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.dto.response.SalesOrderResponse;
import com.inventory.service.SalesOrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SALES_EXECUTIVE')")
public class SalesOrderController {

    private final SalesOrderService salesOrderService;

    @GetMapping("/orders")
    public ResponseEntity<ApiResponse<Page<SalesOrderResponse>>> list(@PageableDefault(size = 20) Pageable pageable) {
        Page<SalesOrderResponse> page = salesOrderService.list(pageable).map(SalesOrderResponse::fromEntity);
        return ResponseEntity.ok(ApiResponse.success(page));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(SalesOrderResponse.fromEntity(salesOrderService.get(id))));
    }

    @GetMapping("/orders/recent")
    public ResponseEntity<ApiResponse<List<SalesOrderResponse>>> recent() {
        List<SalesOrderResponse> list = salesOrderService.recent().stream()
                .map(SalesOrderResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/orders")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> create(@Valid @RequestBody SalesOrderRequest req) {
        SalesOrderResponse created = SalesOrderResponse.fromEntity(salesOrderService.create(req));
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Sales order created", created));
    }

    @PatchMapping("/orders/{id}/status")
    public ResponseEntity<ApiResponse<SalesOrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam com.inventory.entity.SalesOrder.OrderStatus status
    ) {
        SalesOrderResponse updated = SalesOrderResponse.fromEntity(salesOrderService.updateStatus(id, status));
        return ResponseEntity.ok(ApiResponse.success("Status updated", updated));
    }
}