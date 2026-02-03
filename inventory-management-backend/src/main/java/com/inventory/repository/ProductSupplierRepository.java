package com.inventory.repository;

import com.inventory.entity.ProductSupplier;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductSupplierRepository extends JpaRepository<ProductSupplier, Long> {
    List<ProductSupplier> findByProductId(Long productId);
    List<ProductSupplier> findBySupplierId(Long supplierId);
    Optional<ProductSupplier> findByProductIdAndSupplierId(Long productId, Long supplierId);
    void deleteByProductId(Long productId);
}