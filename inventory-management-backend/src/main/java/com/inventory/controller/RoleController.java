package com.inventory.controller;

import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.Role;
import com.inventory.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleRepository roles;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Role>>> all() {
        return ResponseEntity.ok(ApiResponse.success(roles.findAll()));
    }
}