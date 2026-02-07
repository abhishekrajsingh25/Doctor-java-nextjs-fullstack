package com.prescripto.dto;

import lombok.Data;

import java.util.Map;

@Data
public class UpdateProfileRequest {
    private String name;
    private String phone;
    private String gender;
    private String dob;
    private Map<String, Object> address;
}
