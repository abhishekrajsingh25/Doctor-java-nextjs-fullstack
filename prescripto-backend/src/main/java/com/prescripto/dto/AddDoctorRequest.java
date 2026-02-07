package com.prescripto.dto;

import lombok.Data;

@Data
public class AddDoctorRequest {

    private String name;
    private String email;
    private String password;

    private String speciality;
    private String degree;
    private String experience;
    private String about;

    private int fees;
    private String address; // JSON string (same as MERN)
}
