package com.prescripto.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Map;

@Data
@Document(collection = "appointment")
public class Appointment {

    @Id
    private String id;

    private String userId;
    private String docId;

    private String slotDate;
    private String slotTime;

    private Map<String, Object> userData;
    private Map<String, Object> docData;

    private int amount;
    private long date;

    private boolean cancelled = false;
    private boolean payment = false;
    private boolean isCompleted = false;
}
