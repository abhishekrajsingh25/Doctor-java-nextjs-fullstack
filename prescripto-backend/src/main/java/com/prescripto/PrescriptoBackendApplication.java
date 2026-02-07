package com.prescripto;

import jakarta.annotation.PostConstruct;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class PrescriptoBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(PrescriptoBackendApplication.class, args);
	}

	@PostConstruct
	public void init() {
		System.out.println("🚀 Prescripto Backend Started");
	}
}
