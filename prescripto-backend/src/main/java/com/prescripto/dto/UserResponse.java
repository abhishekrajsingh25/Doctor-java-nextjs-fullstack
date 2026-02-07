package com.prescripto.dto;

import lombok.Data;

import java.util.Map;

@Data
public class UserResponse {

    private String id;
    private String name;
    private String email;
    private String image;
    private Map<String, Object> address;
    private String gender;
    private String dob;
    private String phone;
}
