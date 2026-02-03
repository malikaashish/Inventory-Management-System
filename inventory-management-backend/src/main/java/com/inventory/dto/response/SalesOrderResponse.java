package com.inventory.dto.response;

import com.inventory.entity.SalesOrder;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SalesOrderResponse {
    private Long id;
    private String orderNumber;
    private String customerName;
    private LocalDateTime orderDate;
    private String status;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private String shippingAddress;
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
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercent;
        private BigDecimal lineTotal;
    }

    public static SalesOrderResponse fromEntity(SalesOrder so) {
        return SalesOrderResponse.builder()
                .id(so.getId())
                .orderNumber(so.getOrderNumber())
                .customerName(so.getCustomer() != null ? so.getCustomer().getName() : "Walk-in")
                .orderDate(so.getOrderDate())
                .status(so.getStatus().name())
                .subtotal(so.getSubtotal())
                .taxAmount(so.getTaxAmount())
                .discountAmount(so.getDiscountAmount())
                .totalAmount(so.getTotalAmount())
                .shippingAddress(so.getShippingAddress())
                .notes(so.getNotes())
                .items(so.getItems().stream().map(i -> ItemResponse.builder()
                        .id(i.getId())
                        .productId(i.getProduct().getId())
                        .productName(i.getProduct().getName())
                        .productSku(i.getProduct().getSku())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .discountPercent(i.getDiscountPercent())
                        .lineTotal(i.getLineTotal())
                        .build()).collect(Collectors.toList()))
                .build();
    }
}