package com.inventory.repository;

import com.inventory.entity.Customer;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CustomerRepository extends org.springframework.data.jpa.repository.JpaRepository<Customer, Long> {

    List<Customer> findByIsActiveTrue();

    @Query("""
        SELECT c FROM Customer c
        WHERE c.isActive = true AND
          (LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR
           LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);
}