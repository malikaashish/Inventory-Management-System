package com.inventory.controller;

import com.inventory.dto.request.ProfileUpdateRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.User;
import com.inventory.security.SecurityUtils;
import com.inventory.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final SecurityUtils securityUtils;
    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ApiResponse<User>> me() {
        return ResponseEntity.ok(ApiResponse.success(securityUtils.getCurrentUser()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<User>> update(@Valid @RequestBody ProfileUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.success("Profile updated", profileService.update(req)));
    }
}