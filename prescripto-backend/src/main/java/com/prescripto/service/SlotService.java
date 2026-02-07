package com.prescripto.service;

import com.prescripto.model.Doctor;
import com.prescripto.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SlotService {

    private final DoctorRepository doctorRepository;

    public SlotService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }

    public Map<String, List<String>> getAvailableSlots(
            String doctorId,
            int days
    ) {

        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        if (!doctor.isAvailable()) {
            return Map.of();
        }

        Map<String, List<String>> result = new LinkedHashMap<>();
        LocalDate today = LocalDate.now();
        LocalTime now = LocalTime.now();

        DateTimeFormatter timeFormatter =
                DateTimeFormatter.ofPattern("HH:mm");

        for (int i = 0; i < days; i++) {

            LocalDate date = today.plusDays(i);
            LocalTime start = doctor.getWorkStartTime();
            LocalTime end = doctor.getWorkEndTime();

            // 🔒 SAME-DAY MIDNIGHT SAFETY
            if (i == 0 && now.isAfter(end.minusMinutes(doctor.getSlotDuration()))) {
                continue;
            }

            if (i == 0 && now.isAfter(start)) {
                start = now.plusMinutes(doctor.getSlotDuration());
            }

            List<String> availableSlots = new ArrayList<>();

            while (start.plusMinutes(doctor.getSlotDuration()).compareTo(end) <= 0) {

                String slotTime = start.format(timeFormatter);

                List<String> booked =
                        doctor.getSlotsBooked().getOrDefault(
                                date.toString(),
                                List.of()
                        );

                if (!booked.contains(slotTime)) {
                    availableSlots.add(slotTime);
                }

                start = start.plusMinutes(doctor.getSlotDuration());
            }

            if (!availableSlots.isEmpty()) {
                result.put(date.toString(), availableSlots);
            }
        }

        return result;
    }
}
