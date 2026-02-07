# 🏥 Doctor Appointment Booking System with Admin and Doctor Panel  
### Microservices-Based Full Stack Application

This project is a **full-stack Doctor Appointment Booking System** designed to streamline appointment scheduling between patients and doctors.

The system evolved from a monolithic backend into a **microservices-based architecture**, incorporating **Redis caching**, **event-driven communication**, **audit logging**, and **asynchronous notifications**, while maintaining separate interfaces for **Patients**, **Doctors**, and **Admins**.

---

## ✨ Features

### 🧑‍⚕️ Patient Features
- Patient registration and authentication
- Browse and search doctors by specialization
- Book and cancel appointments
- View appointment history and upcoming schedules
- Secure online payments
- Responsive and user-friendly interface

### 👨‍⚕️ Doctor Panel Features
- Doctor authentication and profile management
- Dashboard with overall statistics
- Manage availability and time slots
- View and manage booked appointments

### 🛠️ Admin Panel Features
- Admin authentication
- Add and manage doctors
- Dashboard with overall system statistics
- Manage appointments (view, update, cancel)

---

## 🏗️ Architecture Highlights

- Backend built using **Spring Boot** with a microservices-oriented design
- Modular and loosely coupled services
- Event-driven communication between services
- Asynchronous processing using **RabbitMQ** and **Kafka**
- **Redis** caching and distributed locking for performance and consistency
- AI-powered doctor recommendation integrated at the API layer with strict domain constraints
- Dedicated **Notification Service** for email delivery
- Dedicated **Audit Service** for system-wide event tracking
- **Prometheus** and **Grafana** used for observability and alerting (Audit Service)
- Fault-tolerant messaging with **Dead Letter Queues (DLQ)**
- Designed with serverless and cloud deployment constraints in mind
- **Swagger (OpenAPI)** used for REST API documentation and testing

---

## 🧰 Tech Stack

### Frontend (Patient Application)
- **Next.js**
- **TypeScript**
- Tailwind CSS for UI styling
- Axios for API communication

### Admin Panel
- **React.js**
- **JavaScript**
- React Router
- Tailwind CSS
- Axios

### Backend
- **Spring Boot**
- RESTful APIs
- JWT-based authentication
- MongoDB (primary data store)
- PostgreSQL (Audit Service)
- Redis (Upstash)
- Razorpay integration for payments

---

## 📘 API Documentation (Swagger / OpenAPI)

The backend exposes interactive API documentation using **Swagger (OpenAPI)**.

Swagger enables:
- Exploration of all REST endpoints
- Clear request and response schemas
- JWT-based authentication for protected APIs
- Direct API testing from the browser
- Environment-aware server configuration

---

## 🤖 AI-Powered Doctor Recommendation

The system includes an **AI-powered doctor recommendation feature** to assist patients in choosing the most suitable doctor based on symptoms.

> ⚠️ This feature acts strictly as a **decision-support system** and does **not diagnose medical conditions**.

### 🔍 How It Works
1. The patient enters symptoms (e.g., *chest pain, headache, skin rash*).
2. The backend sends symptoms along with available doctors to an AI model.
3. The AI evaluates symptoms and recommends doctors **only from supported specializations**:
   - General Physician
   - Gynecologist
   - Dermatologist
   - Pediatrician
   - Neurologist
   - Gastroenterologist
4. The response includes:
   - Doctor name
   - Specialization
   - Short explanation for the recommendation
5. The frontend displays recommendations for quick appointment booking.

### 🧠 Design Principles
- AI behavior is strictly controlled by backend rules
- Recommendations are limited to **existing doctors in the system**
- Core business logic remains backend-driven
- AI is used only for ranking and explanation, not diagnosis
- Feature is optional and does not affect the core booking flow

---

## 🧱 Microservices

### 🔔 Notification Service
- Consumes events asynchronously
- Sends appointment and payment-related emails
- Retry handling using delayed retries
- Dead Letter Queue (DLQ) for failed messages

### 🧾 Audit Service
- Captures all domain events for traceability
- Uses **PostgreSQL** for structured audit logs
- Write-heavy, append-only design
- Kafka-based event consumption

---

## 📬 Messaging & Event Streaming

### RabbitMQ (Event Queue + DLQ)
Used for **reliable asynchronous messaging**:

- Publishes domain events such as:
  - `APPOINTMENT_BOOKED`
  - `APPOINTMENT_CANCELLED`
  - `PAYMENT_SUCCESS`
- Notification Service consumes events
- Dead Letter Queues handle failures
- Delayed retries prevent retry storms
- Ensures no message loss

### Kafka (Event Streaming)
Used for **event streaming and audit consistency**:

- Backend produces events to Kafka topics
- Audit Service consumes events independently
- Enables:
  - Loose coupling
  - Replayable event history
  - Scalable audit logging

> RabbitMQ and Kafka are used together to demonstrate different messaging patterns.

---

## ⚡ Caching & Performance

### Redis (Upstash)
Used as a high-performance caching layer:

- Cache doctor listings
- Cache admin and doctor dashboards
- Cache user appointments
- Distributed locking to prevent double booking

### Cache Invalidation
Triggered on:
- Appointment booking
- Appointment cancellation
- Profile updates
- Payment confirmation

**Design Guarantee**
- Redis failures never break core functionality
- MongoDB remains the source of truth

---

## 🔄 Notification & Audit Flow

1. User books, cancels, or pays for an appointment
2. Backend publishes a domain event
3. RabbitMQ delivers the event to Notification Service
4. Email notifications are sent asynchronously
5. Failed messages are retried via DLQ
6. Kafka streams the same events to Audit Service
7. Audit Service stores events for traceability

This ensures:
- Non-blocking user experience
- Reliable message processing
- Clear separation of concerns

---

## 📊 Monitoring & Observability

The system includes observability for the **Audit Service** using **Prometheus** and **Grafana**.

### Metrics (Prometheus)
- Total audit events processed
- Audit events by type (BOOKED, CANCELLED, PAYMENT_SUCCESS)
- Audit insert failure count
- JVM and system-level metrics

### Visualization (Grafana)
- Time-series graphs for event throughput
- Stat panels for total events and failures
- Dedicated dashboards for audit monitoring

### Alerting
- Grafana Alerting configured for:
  - Audit insert failures
- Alerts grouped under a dedicated folder

### Benefits
- Real-time visibility into system behavior
- Early detection of failures
- Lightweight monitoring with minimal overhead

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

Thank you for visiting!  
If you find this project useful or interesting, feel free to explore and contribute.
