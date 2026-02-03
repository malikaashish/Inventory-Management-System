package com.inventory.service;

import com.inventory.dto.request.CustomerRequest;
import com.inventory.entity.Customer;
import com.inventory.exception.ResourceNotFoundException;
import com.inventory.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customers;

    @Transactional(readOnly = true)
    public Page<Customer> getAll(Pageable pageable) {
        return customers.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<Customer> search(String q, Pageable pageable) {
        return customers.searchCustomers(q, pageable);
    }

    @Transactional(readOnly = true)
    public List<Customer> getActive() {
        return customers.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public Customer getById(Long id) {
        return customers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
    }

    @Transactional
    public Customer create(CustomerRequest req) {
        Customer c = Customer.builder()
                .name(req.getName())
                .email(req.getEmail())
                .phone(req.getPhone())
                .address(req.getAddress())
                .city(req.getCity())
                .state(req.getState())
                .country(req.getCountry())
                .postalCode(req.getPostalCode())
                .isActive(true)
                .build();
        return customers.save(c);
    }

    @Transactional
    public Customer update(Long id, CustomerRequest req) {
        Customer c = customers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));

        c.setName(req.getName());
        c.setEmail(req.getEmail());
        c.setPhone(req.getPhone());
        c.setAddress(req.getAddress());
        c.setCity(req.getCity());
        c.setState(req.getState());
        c.setCountry(req.getCountry());
        c.setPostalCode(req.getPostalCode());

        return customers.save(c);
    }

    @Transactional
    public void delete(Long id) {
        Customer c = customers.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found: " + id));
        c.setIsActive(false);
        customers.save(c);
    }
}