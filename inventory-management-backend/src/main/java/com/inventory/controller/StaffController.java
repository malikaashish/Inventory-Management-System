package com.inventory.controller;

import com.inventory.dto.request.AdminUserCreateRequest;
import com.inventory.dto.request.AdminUserUpdateRequest;
import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.User;
import com.inventory.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff/team")
@RequiredArgsConstructor
@PreAuthorize("hasRole('INVENTORY_STAFF')")
public class StaffController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getMyTeam() {
        return ResponseEntity.ok(ApiResponse.success(userService.getMyTeam()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> addMember(@Valid @RequestBody AdminUserCreateRequest req) {
        // Role ID is ignored in service logic for team creation (forced to Sales)
        req.setRoleId(0L); 
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Team member added", userService.createTeamMember(req)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateMember(@PathVariable Long id, @Valid @RequestBody AdminUserUpdateRequest req) {
        req.setRoleId(0L); // Ignored
        return ResponseEntity.ok(ApiResponse.success("Team member updated", userService.updateTeamMember(id, req)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMember(@PathVariable Long id) {
        userService.deleteTeamMember(id);
        return ResponseEntity.ok(ApiResponse.success("Team member removed", null));
    }
}