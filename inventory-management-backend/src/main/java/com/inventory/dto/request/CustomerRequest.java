package com.inventory.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CustomerRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 200)
    private String name;

    @Email(message = "Invalid email")
    @Size(max = 255)
    private String email;

    @Size(max = 20)
    private String phone;

    private String address;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    @Size(max = 100)
    private String country;

    @Size(max = 20)
    private String postalCode;
    
}