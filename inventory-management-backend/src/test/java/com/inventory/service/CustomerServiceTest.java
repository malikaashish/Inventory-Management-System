package com.inventory.service;

import com.inventory.dto.request.CustomerRequest;
import com.inventory.entity.Customer;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.CustomerRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockitoAnnotations;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CustomerServiceTest {

    private AutoCloseable mocks;
    private CustomerRepository customerRepository;
    private CustomerService customerService;

    @BeforeEach
    void setUp() {
        mocks = MockitoAnnotations.openMocks(this);
        customerRepository = mock(CustomerRepository.class);
        customerService = new CustomerService(customerRepository);
    }

    @Test
    void getById_notFound_throws() {
        when(customerRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(ResourceNotFoundException.class, () -> customerService.getById(99L));
    }

    @Test
    void create_savesCustomer() {
        CustomerRequest req = new CustomerRequest();
        req.setName("New Customer");

        when(customerRepository.save(any(Customer.class))).thenAnswer(inv -> {
            Customer c = inv.getArgument(0);
            c.setId(1L);
            return c;
        });

        Customer created = customerService.create(req);
        assertEquals("New Customer", created.getName());
        verify(customerRepository, times(1)).save(any(Customer.class));
    }

    @Test
    void delete_softDeletes() {
        Customer c = Customer.builder().id(1L).name("C1").isActive(true).build();
        when(customerRepository.findById(1L)).thenReturn(Optional.of(c));

        customerService.delete(1L);

        assertFalse(c.getIsActive());
        verify(customerRepository).save(c);
    }
}