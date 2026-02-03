package com.inventory.dto.response;

import com.inventory.entity.PurchaseOrder;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class PurchaseOrderResponse {
    private Long id;
    private String orderNumber;
    private String supplierName;
    private LocalDateTime orderDate;
    private LocalDate expectedDate;
    private LocalDateTime receivedDate;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal shippingCost;
    private BigDecimal totalAmount;
    private String notes;
    private List<ItemResponse> items;

    @Getter @Setter
    @NoArgsConstructor @AllArgsConstructor
    @Builder
    public static class ItemResponse {
        private Long id;
        private Long productId;
        private String productName;
        private String productSku;
        private Integer quantityOrdered;
        private Integer quantityReceived;
        private BigDecimal unitCost;
        private BigDecimal lineTotal;
    }

    public static PurchaseOrderResponse fromEntity(PurchaseOrder po) {
        return PurchaseOrderResponse.builder()
                .id(po.getId())
                .orderNumber(po.getOrderNumber())
                .supplierName(po.getSupplier() != null ? po.getSupplier().getName() : "")
                .orderDate(po.getOrderDate())
                .expectedDate(po.getExpectedDate())
                .receivedDate(po.getReceivedDate())
                .status(po.getStatus().name())
                .subtotal(po.getSubtotal())
                .taxAmount(po.getTaxAmount())
                .shippingCost(po.getShippingCost())
                .totalAmount(po.getTotalAmount())
                .notes(po.getNotes())
                .items(po.getItems().stream().map(i -> ItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productSku(i.getProduct().getSku())
                        .quantityOrdered(i.getQuantityOrdered())
                        .quantityReceived(i.getQuantityReceived())
                        .unitCost(i.getUnitCost())
                        .lineTotal(i.getLineTotal())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}