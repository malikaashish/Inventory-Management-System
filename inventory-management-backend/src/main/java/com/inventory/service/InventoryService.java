package com.inventory.service;

import com.inventory.dto.request.StockAdjustmentRequest;
import com.inventory.entity.Product;
import com.inventory.entity.StockAdjustment;
import com.inventory.entity.User;
import com.inventory.exception.BadRequestException;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.ProductRepository;
import com.inventory.repository.StockAdjustmentRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final ProductRepository products;
    private final StockAdjustmentRepository adjustments;
    private final SecurityUtils securityUtils;
    private final NotificationService notificationService;

    @Transactional
    public StockAdjustment adjust(StockAdjustmentRequest req) {
        User me = securityUtils.getCurrentUser();

        // Lock row to prevent concurrent adjustments corrupting stock
        Product p = products.findByIdForUpdate(req.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + req.getProductId()));

        int before = p.getQuantityOnHand() == null ? 0 : p.getQuantityOnHand();
        int after;
        int change;

        switch (req.getAdjustmentType()) {
            case INCREASE -> {
                if (req.getQuantity() == null || req.getQuantity() <= 0) {
                    throw new BadRequestException("Increase quantity must be > 0");
                }
                change = req.getQuantity();
                after = before + change;
            }
            case DECREASE -> {
                if (req.getQuantity() == null || req.getQuantity() <= 0) {
                    throw new BadRequestException("Decrease quantity must be > 0");
                }
                if (before < req.getQuantity()) {
                    throw new BadRequestException("Insufficient stock. Current: " + before + ", requested: " + req.getQuantity());
                }
                change = -req.getQuantity();
                after = before + change;
            }
            case CORRECTION -> {
                if (req.getQuantity() == null || req.getQuantity() < 0) {
                    throw new BadRequestException("Correction quantity must be >= 0");
                }
                after = req.getQuantity();
                change = after - before;
            }
            default -> throw new BadRequestException("Invalid adjustment type");
        }

        p.setQuantityOnHand(after);
        products.save(p);

        StockAdjustment sa = StockAdjustment.builder()
                .product(p)
                .adjustmentType(req.getAdjustmentType())
                .quantityBefore(before)
                .quantityAfter(after)
                .quantityChange(change)
                .reason(req.getReason())
                .referenceNumber(req.getReferenceNumber())
                .adjustedBy(me)
                .build();

        StockAdjustment saved = adjustments.save(sa);

        if (p.isLowStock()) {
            notificationService.lowStock(
                    p.getId(),
                    p.getSku(),
                    p.getName(),
                    p.getQuantityOnHand(),
                    p.getReorderPoint() == null ? 0 : p.getReorderPoint()
            );
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public Page<StockAdjustment> history(Long productId, Pageable pageable) {
        if (!products.existsById(productId)) {
            throw new ResourceNotFoundException("Product not found: " + productId);
        }
        return adjustments.findByProductId(productId, pageable);
    }
}