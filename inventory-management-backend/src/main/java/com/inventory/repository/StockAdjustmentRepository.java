package com.inventory.repository;

import com.inventory.entity.StockAdjustment;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface StockAdjustmentRepository extends org.springframework.data.jpa.repository.JpaRepository<StockAdjustment, Long> {

    @Query("SELECT sa FROM StockAdjustment sa WHERE sa.product.id = :productId ORDER BY sa.createdAt DESC")
    Page<StockAdjustment> findByProductId(@Param("productId") Long productId, Pageable pageable);
}