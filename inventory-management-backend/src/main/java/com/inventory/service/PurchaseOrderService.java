package com.inventory.service;

import com.inventory.dto.request.PurchaseOrderReceiveItemRequest;
import com.inventory.dto.request.PurchaseOrderRequest;
import com.inventory.entity.*;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.PurchaseOrderRepository;
import com.inventory.repository.SupplierRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrders;
    private final SupplierRepository suppliers;
    private final ProductRepository products;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public Page<PurchaseOrder> list(Pageable pageable) {
        return purchaseOrders.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public PurchaseOrder get(Long id) {
        return purchaseOrders.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrder> pending() {
        return purchaseOrders.findByStatusIn(List.of(
                PurchaseOrder.PurchaseOrderStatus.PENDING,
                PurchaseOrder.PurchaseOrderStatus.APPROVED,
                PurchaseOrder.PurchaseOrderStatus.ORDERED,
                PurchaseOrder.PurchaseOrderStatus.PARTIALLY_RECEIVED
        ));
    }

    @Transactional
    public PurchaseOrder create(PurchaseOrderRequest req) {
        User me = securityUtils.getCurrentUser();

        Supplier supplier = suppliers.findById(req.getSupplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + req.getSupplierId()));

        PurchaseOrder po = PurchaseOrder.builder()
                .orderNumber(generateOrderNumber("PO"))
                .supplier(supplier)
                .orderDate(LocalDateTime.now())
                .expectedDate(req.getExpectedDate())
                .status(PurchaseOrder.PurchaseOrderStatus.DRAFT)
                .taxAmount(nvl(req.getTaxAmount()))
                .shippingCost(nvl(req.getShippingCost()))
                .notes(req.getNotes())
                .createdBy(me)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (PurchaseOrderRequest.Item it : req.getItems()) {
            Product product = products.findById(it.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + it.getProductId()));

            PurchaseOrderItem item = PurchaseOrderItem.builder()
                    .purchaseOrder(po)
                    .product(product)
                    .quantityOrdered(it.getQuantity())
                    .quantityReceived(0)
                    .unitCost(it.getUnitCost())
                    .lineTotal(BigDecimal.ZERO)
                    .build();
            item.computeLineTotal();
            subtotal = subtotal.add(item.getLineTotal());
            po.getItems().add(item);
        }

        po.setSubtotal(subtotal);
        po.setTotalAmount(subtotal.add(po.getTaxAmount()).add(po.getShippingCost()));
        return purchaseOrders.save(po);
    }

    @Transactional
    public PurchaseOrder updateStatus(Long id, PurchaseOrder.PurchaseOrderStatus status) {
        PurchaseOrder po = purchaseOrders.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + id));

        if (po.getStatus() == PurchaseOrder.PurchaseOrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of cancelled PO");
        }
        if (po.getStatus() == PurchaseOrder.PurchaseOrderStatus.RECEIVED) {
            throw new BadRequestException("Cannot change status of received PO");
        }

        User me = securityUtils.getCurrentUser();
        po.setStatus(status);
        po.setUpdatedBy(me);

        if (status == PurchaseOrder.PurchaseOrderStatus.APPROVED) {
            po.setApprovedBy(me);
        }

        return purchaseOrders.save(po);
    }

    @Transactional
    public PurchaseOrder receive(Long id, List<PurchaseOrderReceiveItemRequest> items) {
        PurchaseOrder po = purchaseOrders.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found: " + id));

        if (po.getStatus() != PurchaseOrder.PurchaseOrderStatus.ORDERED &&
            po.getStatus() != PurchaseOrder.PurchaseOrderStatus.PARTIALLY_RECEIVED) {
            throw new BadRequestException("PO must be ORDERED or PARTIALLY_RECEIVED to receive items");
        }

        for (PurchaseOrderReceiveItemRequest ri : items) {
            PurchaseOrderItem line = po.getItems().stream()
                    .filter(x -> x.getId().equals(ri.getItemId()))
                    .findFirst()
                    .orElseThrow(() -> new ResourceNotFoundException("PO item not found: " + ri.getItemId()));

            if (ri.getQuantity() == null || ri.getQuantity() <= 0) {
                throw new BadRequestException("Receive quantity must be > 0");
            }

            int newReceived = line.getQuantityReceived() + ri.getQuantity();
            if (newReceived > line.getQuantityOrdered()) {
                throw new BadRequestException("Received exceeds ordered for SKU " + line.getProduct().getSku());
            }

            line.setQuantityReceived(newReceived);
            products.increaseStock(line.getProduct().getId(), ri.getQuantity());
        }

        boolean allReceived = po.getItems().stream().allMatch(li -> li.getQuantityReceived().equals(li.getQuantityOrdered()));
        po.setStatus(allReceived ? PurchaseOrder.PurchaseOrderStatus.RECEIVED : PurchaseOrder.PurchaseOrderStatus.PARTIALLY_RECEIVED);
        if (allReceived) {
            po.setReceivedDate(LocalDateTime.now());
        }

        po.setUpdatedBy(securityUtils.getCurrentUser());
        return purchaseOrders.save(po);
    }

    private static BigDecimal nvl(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static String generateOrderNumber(String prefix) {
        return prefix + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}