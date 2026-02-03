package com.inventory.service;

import com.inventory.dto.request.SupplierRequest;
import com.inventory.dto.response.SupplierResponse;
import com.inventory.entity.Supplier;
import com.inventory.entity.User;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.SupplierRepository;
import com.inventory.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository suppliers;
    private final SecurityUtils securityUtils;

    @Transactional(readOnly = true)
    public Page<SupplierResponse> getAll(Pageable pageable) {
        return suppliers.findAll(pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public Page<SupplierResponse> search(String q, Pageable pageable) {
        return suppliers.searchSuppliers(q, pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public List<SupplierResponse> getActive() {
        return suppliers.findByIsActiveTrue().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) {
        Supplier s = suppliers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
        return toResponse(s);
    }

    @Transactional
    public SupplierResponse create(SupplierRequest req) {
        User me = securityUtils.getCurrentUser();

        Supplier s = Supplier.builder()
                .name(req.getName())
                .contactPerson(req.getContactPerson())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .postalCode(req.getPostalCode())
                .website(req.getWebsite())
                .notes(req.getNotes())
                .isActive(true)
                .createdBy(me)
                .build();

        return toResponse(suppliers.save(s));
    }

    @Transactional
    public SupplierResponse update(Long id, SupplierRequest req) {
        Supplier s = suppliers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));

        s.setName(req.getName());
        s.setContactPerson(req.getContactPerson());
        s.setEmail(req.getEmail());
        s.setPhone(req.getPhone());
        s.setAddress(req.getAddress());
        s.setCity(req.getCity());
        s.setState(req.getState());
        s.setCountry(req.getCountry());
        s.setPostalCode(req.getPostalCode());
        s.setWebsite(req.getWebsite());
        s.setNotes(req.getNotes());

        return toResponse(suppliers.save(s));
    }

    @Transactional
    public void delete(Long id) {
        Supplier s = suppliers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found: " + id));
        s.setIsActive(false);
        suppliers.save(s);
    }

    private SupplierResponse toResponse(Supplier s) {
        return SupplierResponse.builder()
                .id(s.getId())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .email(s.getEmail())
                .phone(s.getPhone())
                .address(s.getAddress())
                .city(s.getCity())
                .state(s.getState())
                .country(s.getCountry())
                .postalCode(s.getPostalCode())
                .website(s.getWebsite())
                .notes(s.getNotes())
                .isActive(s.getIsActive())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}