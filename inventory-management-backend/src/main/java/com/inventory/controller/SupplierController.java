package com.inventory.controller;

import com.inventory.dto.request.SupplierRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.dto.response.SupplierResponse;
import com.inventory.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class SupplierController {

    private final SupplierService supplierService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<SupplierResponse>>> getAll(
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getAll(pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<SupplierResponse>>> search(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.search(q, pageable)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<SupplierResponse>>> active() {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(supplierService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SupplierResponse>> create(@Valid @RequestBody SupplierRequest req) {
        SupplierResponse created = supplierService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Supplier created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SupplierResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody SupplierRequest req
    ) {
        return ResponseEntity.ok(ApiResponse.success("Supplier updated", supplierService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        supplierService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Supplier deleted", null));
    }
}