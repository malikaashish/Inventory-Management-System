package com.inventory.controller;

import com.inventory.dto.response.ApiResponse;
import com.inventory.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_STAFF')")
    public ResponseEntity<ApiResponse<ReportService.InventoryReport>> inventory() {
        return ResponseEntity.ok(ApiResponse.success(reportService.inventoryReport()));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN','INVENTORY_STAFF')")
    public ResponseEntity<ApiResponse<ReportService.LowStockReport>> lowStock() {
        return ResponseEntity.ok(ApiResponse.success(reportService.lowStockReport()));
    }

    @GetMapping("/sales")
    @PreAuthorize("hasAnyRole('ADMIN','SALES_EXECUTIVE')")
    public ResponseEntity<ApiResponse<ReportService.SalesReport>> sales(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) Long productId
    ) {
        return ResponseEntity.ok(ApiResponse.success(reportService.salesReport(startDate, endDate, productId)));
    }
}