package com.inventory.service;

import com.inventory.dto.request.SupplierRequest;
import com.inventory.dto.response.SupplierResponse;
import com.inventory.entity.Supplier;
import com.inventory.entity.User;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.SupplierRepository;
import com.inventory.security.SecurityUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.*;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class SupplierServiceTest {

    private SupplierRepository supplierRepository;
    private SecurityUtils securityUtils;
    private SupplierService supplierService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        supplierRepository = mock(SupplierRepository.class);
        securityUtils = mock(SecurityUtils.class);
        supplierService = new SupplierService(supplierRepository, securityUtils);
    }

    @Test
    void getAll_returnsPaged() {
        Pageable pageable = PageRequest.of(0, 20);
        Supplier s = Supplier.builder().id(10L).name("S1").isActive(true).build();
        when(supplierRepository.findAll(pageable)).thenReturn(new PageImpl<>(List.of(s), pageable, 1));

        Page<SupplierResponse> res = supplierService.getAll(pageable);
        assertEquals(1, res.getTotalElements());
        assertEquals("S1", res.getContent().get(0).getName());
    }

    @Test
    void getById_notFound_throws() {
        when(supplierRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> supplierService.getById(99L));
    }

    @Test
    void create_setsCreatedBy_andActive() {
        SupplierRequest req = new SupplierRequest();
        req.setName("New");

        User me = User.builder().id(1L).email("a@b.com").firstName("A").lastName("B").build();
        when(securityUtils.getCurrentUser()).thenReturn(me);

        when(supplierRepository.save(any(Supplier.class))).thenAnswer(inv -> {
            Supplier saved = inv.getArgument(0);
            saved.setId(50L);
            return saved;
        });

        SupplierResponse created = supplierService.create(req);
        assertEquals("New", created.getName());
        assertTrue(created.getIsActive());
        verify(supplierRepository).save(any(Supplier.class));
    }

    @Test
    void delete_softDeletes() {
        Supplier s = Supplier.builder().id(10L).name("S1").isActive(true).build();
        when(supplierRepository.findById(10L)).thenReturn(Optional.of(s));

        supplierService.delete(10L);

        assertFalse(s.getIsActive());
        verify(supplierRepository).save(s);
    }
}