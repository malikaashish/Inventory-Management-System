package com.inventory.controller;

import com.inventory.dto.response.ApiResponse;
import com.inventory.entity.Category;
import com.inventory.service.CategoryService;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> listActive() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.listActive()));
    }

    @GetMapping("/tree")
    public ResponseEntity<ApiResponse<List<Category>>> treeRoots() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.treeRoots()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> get(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.get(id)));
    }

    // --- ALLOW STAFF TO CREATE CATEGORIES ---
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_STAFF')") 
    public ResponseEntity<ApiResponse<Category>> create(@RequestBody CategoryRequest req) {
        Category c = categoryService.create(req.getName(), req.getDescription(), req.getParentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Category created", c));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'INVENTORY_STAFF')")
    public ResponseEntity<ApiResponse<Category>> update(@PathVariable Long id, @RequestBody CategoryRequest req) {
        Category c = categoryService.update(id, req.getName(), req.getDescription(), req.getParentId());
        return ResponseEntity.ok(ApiResponse.success("Category updated", c));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }

    @Getter @Setter
    public static class CategoryRequest {
        @NotBlank @Size(max = 100)
        private String name;
        private String description;
        private Long parentId;
    }
}