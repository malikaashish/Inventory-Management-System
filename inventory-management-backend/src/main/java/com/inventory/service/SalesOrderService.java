package com.inventory.service;

import com.inventory.dto.request.SalesOrderRequest;
import com.inventory.entity.*;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.CustomerRepository;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.SalesOrderRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalesOrderService {

    private final SalesOrderRepository salesOrders;
    private final ProductRepository products;
    private final CustomerRepository customers;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    public Page<SalesOrder> list(Pageable pageable) {
        return salesOrders.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public SalesOrder get(Long id) {
        return salesOrders.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order not found: " + id));
    }

    @Transactional(readOnly = true)
    public java.util.List<SalesOrder> recent() {
        return salesOrders.findTop10ByOrderByOrderDateDesc();
    }

    @Transactional
    public SalesOrder create(SalesOrderRequest req) {
        User me = securityUtils.getCurrentUser();

        SalesOrder order = SalesOrder.builder()
                .orderNumber(generateOrderNumber("SO"))
                .orderDate(LocalDateTime.now())
                .status(SalesOrder.OrderStatus.PENDING)
                .taxAmount(nvl(req.getTaxAmount()))
                .discountAmount(nvl(req.getDiscountAmount()))
                .shippingAddress(req.getShippingAddress())
                .notes(req.getNotes())
                .createdBy(me)
                .build();

        if (req.getCustomerId() != null) {
            Customer c = customers.findById(req.getCustomerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + req.getCustomerId()));
            order.setCustomer(c);
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        for (SalesOrderRequest.Item it : req.getItems()) {
            Product product = products.findById(it.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + it.getProductId()));

            // --- VALIDATION: EXPIRY CHECK ---
            if (product.isExpired()) {
                throw new BadRequestException(
                    String.format("Cannot sell expired product: %s (Expired on: %s)", 
                    product.getName(), product.getExpiryDate()));
            }
            // --------------------------------

            int updated = products.decreaseStock(product.getId(), it.getQuantity());
            if (updated == 0) {
                throw new BadRequestException("Insufficient stock for SKU " + product.getSku());
            }

            BigDecimal unitPrice = it.getUnitPrice() != null ? it.getUnitPrice() : product.getUnitPrice();

            SalesOrderItem item = SalesOrderItem.builder()
                    .salesOrder(order)
                    .product(product)
                    .quantity(it.getQuantity())
                    .unitPrice(unitPrice)
                    .discountPercent(nvl(it.getDiscountPercent()))
                    .lineTotal(BigDecimal.ZERO)
                    .build();

            item.computeLineTotal();
            subtotal = subtotal.add(item.getLineTotal());

            order.getItems().add(item);

            Product refreshed = products.findById(product.getId()).orElse(product);
            if (refreshed.isLowStock()) {
                notificationService.lowStock(
                        refreshed.getId(),
                        refreshed.getSku(),
                        refreshed.getName(),
                        refreshed.getQuantityOnHand(),
                        refreshed.getReorderPoint() == null ? 0 : refreshed.getReorderPoint()
                );
            }
        }

        order.setSubtotal(subtotal);
        order.setTotalAmount(subtotal.add(order.getTaxAmount()).subtract(order.getDiscountAmount()));

        return salesOrders.save(order);
    }

    @Transactional
    public SalesOrder updateStatus(Long id, SalesOrder.OrderStatus status) {
        SalesOrder order = salesOrders.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sales order not found: " + id));

        if (order.getStatus() == SalesOrder.OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of cancelled order");
        }
        if (order.getStatus() == SalesOrder.OrderStatus.COMPLETED && status != SalesOrder.OrderStatus.COMPLETED) {
            throw new BadRequestException("Cannot change status of completed order");
        }

        if (status == SalesOrder.OrderStatus.CANCELLED) {
            for (SalesOrderItem item : order.getItems()) {
                products.increaseStock(item.getProduct().getId(), item.getQuantity());
            }
        }

        User me = securityUtils.getCurrentUser();
        order.setStatus(status);
        order.setUpdatedBy(me);
        return salesOrders.save(order);
    }

    private static BigDecimal nvl(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static String generateOrderNumber(String prefix) {
        return prefix + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}