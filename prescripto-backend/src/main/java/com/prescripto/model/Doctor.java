package com.prescripto.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Data
@Document(collection = "doctor")
public class Doctor {

    @Id
    private String id;

    private String name;
    private String email;
    private String password;
    private String image;

    private String speciality;
    private String degree;
    private String experience;
    private String about;

    private boolean available = true;
    private int fees;

    private Map<String, Object> address;

    // 🔹 WORKING HOURS
    private LocalTime workStartTime = LocalTime.of(10, 0);
    private LocalTime workEndTime = LocalTime.of(21, 0);
    private int slotDuration = 30; // minutes

    // slotDate -> [slotTime1, slotTime2]
    private Map<String, List<String>> slotsBooked = new HashMap<>();

    private long date;
}
