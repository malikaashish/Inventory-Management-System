package com.inventory.repository;

import com.inventory.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role.name = :roleName AND u.isActive = true")
    List<User> findByRoleName(String roleName);

    // Find Sales Team managed by specific Inventory Staff
    List<User> findByManagerId(Long managerId);
    
    // CRITICAL: Fetch only active users for Admin List
    Page<User> findByIsActiveTrue(Pageable pageable);
}