package com.inventory.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class ProductResponse {
    private Long id;
    private String sku;
    private String name;
    private String description;

    private Long categoryId;
    private String categoryName;

    private BigDecimal unitPrice;
    private BigDecimal costPrice;

    private Integer quantityOnHand;
    private Integer reorderPoint;
    private Integer reorderQuantity;
    private Boolean autoReorderEnabled;

    private LocalDate expiryDate; // <-- NEW FIELD
    private boolean isExpired;    // <-- NEW FIELD (Computed)

    private String unitOfMeasure;
    private String location;
    private String barcode;
    private String imageUrl;

    private Boolean isActive;
    private Boolean isLowStock;
    private BigDecimal totalValue;

    private List<SupplierInfo> suppliers;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class SupplierInfo {
        private Long id;
        private String name;
        private String contactPerson;
    }
}