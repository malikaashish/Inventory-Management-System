package com.inventory.controller;

import com.inventory.dto.request.PasswordChangeRequest;
import com.inventory.dto.request.PasswordResetRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.service.PasswordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class PasswordController {

    private final PasswordService passwordService;

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> change(@Valid @RequestBody PasswordChangeRequest req) {
        passwordService.change(req);
        return ResponseEntity.ok(ApiResponse.success("Password changed", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgot(@Valid @RequestBody PasswordResetRequest req) {
        passwordService.forgot(req.getEmail());
        return ResponseEntity.ok(ApiResponse.success(
                "If an account exists, a reset link will be sent", null));
    }
}