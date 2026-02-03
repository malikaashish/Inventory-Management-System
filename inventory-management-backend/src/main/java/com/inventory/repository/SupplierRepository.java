package com.inventory.repository;

import com.inventory.entity.Supplier;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SupplierRepository extends org.springframework.data.jpa.repository.JpaRepository<Supplier, Long> {

    List<Supplier> findByIsActiveTrue();

    @Query("""
        SELECT s FROM Supplier s
        WHERE s.isActive = true AND
          (LOWER(s.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
           LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Supplier> searchSuppliers(@Param("search") String search, Pageable pageable);
}