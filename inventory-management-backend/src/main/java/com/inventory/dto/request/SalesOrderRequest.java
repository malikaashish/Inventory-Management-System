package com.inventory.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
public class SalesOrderRequest {

    private Long customerId;

    @NotEmpty(message = "Order must have at least one item")
    @Valid
    private List<Item> items;

    @DecimalMin(value = "0.00")
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00")
    private BigDecimal discountAmount = BigDecimal.ZERO;

    private String shippingAddress;
    private String notes;

    @Getter @Setter
    public static class Item {
        @NotNull(message = "Product ID is required")
        private Long productId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be >= 1")
        private Integer quantity;

        // Optional: if null, use product.unitPrice
        @DecimalMin(value = "0.00")
        private BigDecimal unitPrice;

        @DecimalMin(value = "0.00")
        @DecimalMax(value = "100.00")
        private BigDecimal discountPercent = BigDecimal.ZERO;
    }
}