package com.inventory.controller;

import com.inventory.dto.request.CustomerRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.Customer;
import com.inventory.service.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','SALES_EXECUTIVE')")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<Customer>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getAll(pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<Customer>>> search(
            @RequestParam String q,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(ApiResponse.success(customerService.search(q, pageable)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<Customer>>> active() {
        return ResponseEntity.ok(ApiResponse.success(customerService.getActive()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> create(@Valid @RequestBody CustomerRequest req) {
        Customer created = customerService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Customer created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> update(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Customer updated", customerService.update(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted", null));
    }
}