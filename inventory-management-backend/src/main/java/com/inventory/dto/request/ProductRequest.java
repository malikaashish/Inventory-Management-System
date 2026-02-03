package com.inventory.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Getter @Setter
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 100)
    private String sku;

    @NotBlank(message = "Name is required")
    @Size(max = 255)
    private String name;

    private String description;

    private Long categoryId;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.00")
    private BigDecimal unitPrice;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.00")
    private BigDecimal costPrice;

    @Min(0)
    private Integer quantityOnHand;

    @Min(0)
    private Integer reorderPoint;

    @Min(1)
    private Integer reorderQuantity;

    private Boolean autoReorderEnabled;

    private LocalDate expiryDate; 

    @Size(max = 50)
    private String unitOfMeasure;

    @Size(max = 50)
    private String location;

    @Size(max = 100)
    private String barcode;

    @Size(max = 500)
    private String imageUrl;

    private Set<Long> supplierIds;
}