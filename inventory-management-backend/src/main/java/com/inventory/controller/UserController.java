package com.inventory.controller;

import com.inventory.dto.request.AdminUserCreateRequest;
import com.inventory.dto.request.AdminUserUpdateRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.User;
import com.inventory.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> list(@PageableDefault(size = 20) Pageable pageable) {
        // Will now return ONLY active users
        return ResponseEntity.ok(ApiResponse.success(userService.getAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getById(id)));
    }

    @GetMapping("/role/{roleName}")
    public ResponseEntity<ApiResponse<List<User>>> byRole(@PathVariable String roleName) {
        return ResponseEntity.ok(ApiResponse.success(userService.getByRole(roleName)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> create(@Valid @RequestBody AdminUserCreateRequest req) {
        User created = userService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> update(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("User updated", userService.update(id, req)));
    }

    @PatchMapping("/{id}/activate")
    public ResponseEntity<ApiResponse<Void>> activate(@PathVariable Long id) {
        userService.activate(id);
        return ResponseEntity.ok(ApiResponse.success("User activated", null));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<Void>> deactivate(@PathVariable Long id) {
        userService.deactivate(id);
        return ResponseEntity.ok(ApiResponse.success("User deactivated", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        // Calls the softDelete method which marks inactive and protects Admin
        userService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted", null));
    }
}