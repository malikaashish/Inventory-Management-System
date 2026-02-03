package com.inventory.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class DashboardResponse {

    private InventoryMetrics inventoryMetrics;
    private SalesMetrics salesMetrics;
    private List<LowStockItem> lowStockItems;
    private List<RecentOrder> recentOrders;
    private List<ChartData> salesChart;
    private List<PieChartData> departmentSales;
    private List<ProductPieChartData> productSales;
    private List<ProductPieChartData> underPerformingProducts;
    
    // --- NEW FIELDS ---
    private List<ExpiringItem> expiringSoon;
    private List<DeadStockItem> deadStock;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class InventoryMetrics {
        private Integer totalProducts;
        private Integer totalQuantity;
        private BigDecimal totalInventoryValue;
        private Integer lowStockCount;
        private Integer outOfStockCount;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class SalesMetrics {
        private Integer totalOrdersToday;
        private BigDecimal revenueToday;
        private Integer totalOrdersThisMonth;
        private BigDecimal revenueThisMonth;
        private BigDecimal averageOrderValueThisMonth;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class LowStockItem {
        private Long productId;
        private String sku;
        private String productName;
        private Integer currentStock;
        private Integer reorderPoint;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class RecentOrder {
        private Long orderId;
        private String orderNumber;
        private String customerName;
        private BigDecimal totalAmount;
        private String status;
        private String orderDate;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ChartData {
        private String date;
        private int orderCount;
        private BigDecimal revenue;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class PieChartData { 
        private String name;
        private BigDecimal value;
    }

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ProductPieChartData { 
        private String productName;
        private Long totalSold;
    }

    // --- NEW DTO CLASS ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ExpiringItem {
        private Long id;
        private String name;
        private String sku;
        private String expiryDate;
        private Integer daysRemaining;
    }

    // --- NEW DTO CLASS ---
    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class DeadStockItem {
        private Long id;
        private String name;
        private String sku;
        private Integer currentStock;
        private String category;
    }
}