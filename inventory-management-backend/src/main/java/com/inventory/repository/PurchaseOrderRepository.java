package com.inventory.repository;

import com.inventory.entity.PurchaseOrder;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends org.springframework.data.jpa.repository.JpaRepository<PurchaseOrder, Long> {

    @EntityGraph(attributePaths = {"items","items.product","supplier","createdBy","updatedBy","approvedBy"})
    Page<PurchaseOrder> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"items","items.product","supplier","createdBy","updatedBy","approvedBy"})
    Optional<PurchaseOrder> findById(Long id);

    @EntityGraph(attributePaths = {"items","items.product","supplier"})
    List<PurchaseOrder> findByStatusIn(List<PurchaseOrder.PurchaseOrderStatus> statuses);
}