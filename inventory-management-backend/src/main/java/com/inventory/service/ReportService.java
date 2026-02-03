package com.inventory.service;

import com.inventory.entity.Product;
import com.inventory.entity.SalesOrder;
import com.inventory.entity.User;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SalesOrderRepository;
import com.inventory.security.SecurityUtils;
import lombok.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ProductRepository products;
    private final SalesOrderRepository salesOrders;
    private final SecurityUtils securityUtils; // Added

    @Transactional(readOnly = true)
    public InventoryReport inventoryReport() {
        User user = securityUtils.getCurrentUser();
        List<Product> list;

        // FILTER: If Inventory Staff, show only their department's products
        if (user.getRole().getName().equals("INVENTORY_STAFF") && user.getDepartment() != null) {
            // We use the existing repo method (paginated), but here we want all. 
            // Better to add a non-paginated list method or just fetch all and filter in stream (if list is small)
            // Or add findByCategoryNameList to repo.
            // Let's filter in stream for simplicity unless dataset is huge.
            list = products.findByIsActiveTrue().stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getName().equals(user.getDepartment()))
                    .collect(Collectors.toList());
        } else {
            list = products.findByIsActiveTrue();
        }

        BigDecimal totalValue = list.stream()
                .map(Product::getTotalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long lowCount = list.stream().filter(Product::isLowStock).count();

        List<InventoryItem> items = list.stream().map(p ->
                InventoryItem.builder()
                        .sku(p.getSku())
                        .name(p.getName())
                        .category(p.getCategory() != null ? p.getCategory().getName() : "Uncategorized")
                        .quantityOnHand(p.getQuantityOnHand() == null ? 0 : p.getQuantityOnHand())
                        .reorderPoint(p.getReorderPoint() == null ? 0 : p.getReorderPoint())
                        .costPrice(p.getCostPrice())
                        .unitPrice(p.getUnitPrice())
                        .totalValue(p.getTotalValue())
                        .lowStock(p.isLowStock())
                        .build()
        ).toList();

        int totalQty = list.stream().mapToInt(p -> p.getQuantityOnHand() == null ? 0 : p.getQuantityOnHand()).sum();

        return InventoryReport.builder()
                .generatedAt(LocalDateTime.now())
                .totalProducts(list.size())
                .totalQuantity(totalQty)
                .totalValue(totalValue)
                .lowStockCount((int) lowCount)
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public LowStockReport lowStockReport() {
        User user = securityUtils.getCurrentUser();
        List<Product> low;

        // FILTER: If Inventory Staff, show only their department's low stock
        if (user.getRole().getName().equals("INVENTORY_STAFF") && user.getDepartment() != null) {
             low = products.findLowStockProducts().stream()
                    .filter(p -> p.getCategory() != null && p.getCategory().getName().equals(user.getDepartment()))
                    .collect(Collectors.toList());
        } else {
             low = products.findLowStockProducts();
        }

        List<LowStockItem> items = low.stream()
                .map(p -> LowStockItem.builder()
                        .sku(p.getSku())
                        .name(p.getName())
                        .category(p.getCategory() != null ? p.getCategory().getName() : "Uncategorized")
                        .currentStock(p.getQuantityOnHand() == null ? 0 : p.getQuantityOnHand())
                        .reorderPoint(p.getReorderPoint() == null ? 0 : p.getReorderPoint())
                        .reorderQuantity(p.getReorderQuantity() == null ? 0 : p.getReorderQuantity())
                        .shortfall((p.getReorderPoint() == null ? 0 : p.getReorderPoint()) - (p.getQuantityOnHand() == null ? 0 : p.getQuantityOnHand()))
                        .build())
                .sorted(Comparator.comparingInt(LowStockItem::getShortfall).reversed())
                .toList();

        return LowStockReport.builder()
                .generatedAt(LocalDateTime.now())
                .totalLowStockItems(items.size())
                .items(items)
                .build();
    }

    @Transactional(readOnly = true)
    public SalesReport salesReport(LocalDateTime start, LocalDateTime end, Long productId) {
        // Sales report is usually global or filtered by product. 
        // If staff needs to see only THEIR department sales, we filter by order creator's department.
        
        User user = securityUtils.getCurrentUser();
        List<SalesOrder> orders = salesOrders.findByOrderDateBetween(start, end);

        if (user.getRole().getName().equals("INVENTORY_STAFF") && user.getDepartment() != null) {
            orders = orders.stream()
                    .filter(o -> {
                        // Check if order creator belongs to this staff's department 
                        // OR if the products in the order belong to this department
                        // Usually easier to check Product Category
                        return o.getItems().stream().anyMatch(i -> 
                            i.getProduct().getCategory() != null && 
                            i.getProduct().getCategory().getName().equals(user.getDepartment()));
                    })
                    .collect(Collectors.toList());
        }

        if (productId != null) {
            orders = orders.stream()
                    .filter(o -> o.getItems().stream().anyMatch(i -> i.getProduct().getId().equals(productId)))
                    .toList();
        }

        List<SalesOrder> nonCancelled = orders.stream()
                .filter(o -> o.getStatus() != SalesOrder.OrderStatus.CANCELLED)
                .toList();

        BigDecimal totalRevenue = nonCancelled.stream()
                .map(SalesOrder::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        int totalOrders = nonCancelled.size();

        int totalItemsSold = nonCancelled.stream()
                .flatMap(o -> o.getItems().stream())
                .mapToInt(i -> i.getQuantity() == null ? 0 : i.getQuantity())
                .sum();

        Map<String, DailySales> byDay = new LinkedHashMap<>();
        nonCancelled.forEach(o -> {
            String day = o.getOrderDate() != null ? o.getOrderDate().toLocalDate().toString() : "unknown";
            DailySales ds = byDay.computeIfAbsent(day, k -> new DailySales(day, 0, BigDecimal.ZERO));
            ds.setOrderCount(ds.getOrderCount() + 1);
            ds.setRevenue(ds.getRevenue().add(o.getTotalAmount() == null ? BigDecimal.ZERO : o.getTotalAmount()));
        });

        return SalesReport.builder()
                .generatedAt(LocalDateTime.now())
                .startDate(start)
                .endDate(end)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalItemsSold(totalItemsSold)
                .dailySales(new ArrayList<>(byDay.values()))
                .build();
    }

    // ===== DTOs (Same as before) =====
    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InventoryReport {
        private LocalDateTime generatedAt;
        private int totalProducts;
        private int totalQuantity;
        private BigDecimal totalValue;
        private int lowStockCount;
        private List<InventoryItem> items;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class InventoryItem {
        private String sku;
        private String name;
        private String category;
        private int quantityOnHand;
        private int reorderPoint;
        private BigDecimal costPrice;
        private BigDecimal unitPrice;
        private BigDecimal totalValue;
        private boolean lowStock;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LowStockReport {
        private LocalDateTime generatedAt;
        private int totalLowStockItems;
        private List<LowStockItem> items;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class LowStockItem {
        private String sku;
        private String name;
        private String category;
        private int currentStock;
        private int reorderPoint;
        private int reorderQuantity;
        private int shortfall;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SalesReport {
        private LocalDateTime generatedAt;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private int totalOrders;
        private BigDecimal totalRevenue;
        private int totalItemsSold;
        private List<DailySales> dailySales;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor
    public static class DailySales {
        private String date;
        private int orderCount;
        private BigDecimal revenue;
    }
}