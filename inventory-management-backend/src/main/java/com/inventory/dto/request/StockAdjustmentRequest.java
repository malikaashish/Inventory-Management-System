package com.inventory.dto.request;

import com.inventory.entity.StockAdjustment;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class StockAdjustmentRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Adjustment type is required")
    private StockAdjustment.AdjustmentType adjustmentType;

    /**
     * For INCREASE/DECREASE: quantity delta (>0)
     * For CORRECTION: the absolute quantity_on_hand you want to set (>=0)
     */
    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity must be >= 0")
    private Integer quantity;

    @NotBlank(message = "Reason is required")
    @Size(max = 500, message = "Reason must be <= 500 characters")
    private String reason;

    @Size(max = 100)
    private String referenceNumber;
}