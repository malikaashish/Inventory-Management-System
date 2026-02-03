package com.inventory.service;

import com.inventory.entity.Category;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categories ;

    @Transactional(readOnly = true)
    public List<Category> listActive() {
        return categories.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<Category> treeRoots() {
        return categories.findRootCategories();
    }

    @Transactional(readOnly = true)
    public Category get(Long id) {
        return categories.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));
    }

    @Transactional
    public Category create(String name, String description, Long parentId) {
        if (categories.existsByName(name)) {
            throw new BadRequestException("Category name already exists: " + name);
        }

        Category c = Category.builder()
                .name(name)
                .description(description)
                .isActive(true)
                .build();

        if (parentId != null) {
            Category parent = categories.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found: " + parentId));
            c.setParent(parent);
        }

        return categories.save(c);
    }

    @Transactional
    public Category update(Long id, String name, String description, Long parentId) {
        Category c = categories.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        if (!c.getName().equals(name) && categories.existsByName(name)) {
            throw new BadRequestException("Category name already exists: " + name);
        }

        if (parentId != null && parentId.equals(id)) {
            throw new BadRequestException("Category cannot be its own parent");
        }

        c.setName(name);
        c.setDescription(description);

        if (parentId != null) {
            Category parent = categories.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category not found: " + parentId));
            c.setParent(parent);
        } else {
            c.setParent(null);
        }

        return categories.save(c);
    }

    @Transactional
    public void delete(Long id) {
        Category c = categories.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + id));

        if (!categories.findByParentId(id).isEmpty()) {
            throw new BadRequestException("Cannot delete category with children");
        }

        c.setIsActive(false);
        categories.save(c);
    }
}