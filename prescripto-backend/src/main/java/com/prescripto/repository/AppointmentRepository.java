package com.prescripto.repository;

import com.prescripto.model.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByUserId(String userId);

    List<Appointment> findByDocId(String docId);
}
