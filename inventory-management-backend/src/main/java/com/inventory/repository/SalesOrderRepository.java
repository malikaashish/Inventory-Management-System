package com.inventory.repository;

import com.inventory.entity.SalesOrder;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    // ... existing CRUD methods ...
    @EntityGraph(attributePaths = {"items", "items.product", "customer", "createdBy", "updatedBy"})
    Page<SalesOrder> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"items", "items.product", "customer", "createdBy", "updatedBy"})
    Optional<SalesOrder> findById(Long id);

    @EntityGraph(attributePaths = {"items", "items.product", "customer"})
    List<SalesOrder> findByOrderDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    // --- RECENT ORDERS ---
    @EntityGraph(attributePaths = {"items", "items.product", "customer"})
    List<SalesOrder> findTop10ByOrderByOrderDateDesc();

    // New: Recent Orders by Department
    @EntityGraph(attributePaths = {"items", "items.product", "customer"})
    @Query("SELECT o FROM SalesOrder o JOIN o.createdBy u WHERE u.department = :dept ORDER BY o.orderDate DESC")
    List<SalesOrder> findTop10ByDepartmentOrderByOrderDateDesc(@Param("dept") String dept, Pageable pageable);

    // --- METRICS (COUNTS & REVENUE) ---
    
    // Global
    @Query("SELECT COUNT(so) FROM SalesOrder so WHERE so.orderDate >= :start AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED")
    Integer countNonCancelledSince(@Param("start") LocalDateTime start);

    @Query("SELECT COALESCE(SUM(so.totalAmount), 0) FROM SalesOrder so WHERE so.orderDate >= :start AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED")
    BigDecimal sumRevenueSince(@Param("start") LocalDateTime start);

    // Department Specific
    @Query("SELECT COUNT(so) FROM SalesOrder so JOIN so.createdBy u WHERE u.department = :dept AND so.orderDate >= :start AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED")
    Integer countNonCancelledSinceByDept(@Param("start") LocalDateTime start, @Param("dept") String dept);

    @Query("SELECT COALESCE(SUM(so.totalAmount), 0) FROM SalesOrder so JOIN so.createdBy u WHERE u.department = :dept AND so.orderDate >= :start AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED")
    BigDecimal sumRevenueSinceByDept(@Param("start") LocalDateTime start, @Param("dept") String dept);

    // --- CHARTS (DAILY/MONTHLY TRENDS) ---

    // Global
    @Query("""
        SELECT CAST(so.orderDate AS LocalDate) as date, COUNT(so), SUM(so.totalAmount) 
        FROM SalesOrder so 
        WHERE so.orderDate >= :startDate AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED
        GROUP BY CAST(so.orderDate AS LocalDate) ORDER BY date ASC
    """)
    List<Object[]> findSalesStatsByDateRange(@Param("startDate") LocalDateTime startDate);

    @Query("""
        SELECT YEAR(so.orderDate), MONTH(so.orderDate), COUNT(so), SUM(so.totalAmount) 
        FROM SalesOrder so 
        WHERE so.orderDate >= :startDate AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED
        GROUP BY YEAR(so.orderDate), MONTH(so.orderDate) ORDER BY 1 ASC, 2 ASC
    """)
    List<Object[]> findSalesStatsByMonth(@Param("startDate") LocalDateTime startDate);

    // Department Specific
    @Query("""
        SELECT CAST(so.orderDate AS LocalDate) as date, COUNT(so), SUM(so.totalAmount) 
        FROM SalesOrder so JOIN so.createdBy u
        WHERE u.department = :dept AND so.orderDate >= :startDate AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED
        GROUP BY CAST(so.orderDate AS LocalDate) ORDER BY date ASC
    """)
    List<Object[]> findSalesStatsByDateRangeByDept(@Param("startDate") LocalDateTime startDate, @Param("dept") String dept);

    @Query("""
        SELECT YEAR(so.orderDate), MONTH(so.orderDate), COUNT(so), SUM(so.totalAmount) 
        FROM SalesOrder so JOIN so.createdBy u
        WHERE u.department = :dept AND so.orderDate >= :startDate AND so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED
        GROUP BY YEAR(so.orderDate), MONTH(so.orderDate) ORDER BY 1 ASC, 2 ASC
    """)
    List<Object[]> findSalesStatsByMonthByDept(@Param("startDate") LocalDateTime startDate, @Param("dept") String dept);

    // --- PIE CHARTS (DEPARTMENT SHARE) ---
    // Note: If viewing specific department, this might look boring (100%), but useful for Admin.
    @Query("""
        SELECT COALESCE(u.department, 'Unassigned'), SUM(so.totalAmount) 
        FROM SalesOrder so JOIN so.createdBy u 
        WHERE so.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED
        GROUP BY u.department
    """)
    List<Object[]> findSalesByDepartment();

    // --- PRODUCT PERFORMANCE (TOP & LEAST SELLING) ---

    // Global
    @Query("""
        SELECT p.name, SUM(i.quantity) as totalSold 
        FROM SalesOrderItem i JOIN i.product p JOIN i.salesOrder o
        WHERE o.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED
        GROUP BY p.name ORDER BY totalSold DESC LIMIT 5
    """)
    List<Object[]> findTopSellingProducts();

    @Query("""
        SELECT p.name, SUM(i.quantity) as totalSold 
        FROM SalesOrderItem i JOIN i.product p JOIN i.salesOrder o
        WHERE o.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED
        GROUP BY p.name ORDER BY totalSold ASC LIMIT 5
    """)
    List<Object[]> findLeastSellingProducts();

    // Department Specific (Filtered by Product Category = Department Name)
    @Query("""
        SELECT p.name, SUM(i.quantity) as totalSold 
        FROM SalesOrderItem i JOIN i.product p JOIN p.category c JOIN i.salesOrder o
        WHERE o.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED AND c.name = :dept
        GROUP BY p.name ORDER BY totalSold DESC LIMIT 5
    """)
    List<Object[]> findTopSellingProductsByDept(@Param("dept") String dept);

    @Query("""
        SELECT p.name, SUM(i.quantity) as totalSold 
        FROM SalesOrderItem i JOIN i.product p JOIN p.category c JOIN i.salesOrder o
        WHERE o.status <> com.inventory.entity.SalesOrder$OrderStatus.CANCELLED AND c.name = :dept
        GROUP BY p.name ORDER BY totalSold ASC LIMIT 5
    """)
    List<Object[]> findLeastSellingProductsByDept(@Param("dept") String dept);
}