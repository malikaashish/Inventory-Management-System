package com.inventory.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter
public class PurchaseOrderRequest {

    @NotNull(message = "Supplier ID is required")
    private Long supplierId;

    private LocalDate expectedDate;

    @NotEmpty(message = "Purchase order must have at least one item")
    @Valid
    private List<Item> items;

    @DecimalMin(value = "0.00")
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00")
    private BigDecimal shippingCost = BigDecimal.ZERO;

    private String notes;

    @Getter @Setter
    public static class Item {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be >= 1")
        private Integer quantity;

        @NotNull(message = "Unit cost is required")
        @DecimalMin(value = "0.00")
        private BigDecimal unitCost;
    }
}