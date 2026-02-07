package com.prescripto.config;

import com.prescripto.security.AdminAuthFilter;
import com.prescripto.security.DoctorAuthFilter;
import com.prescripto.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
//@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final DoctorAuthFilter doctorAuthFilter;
    private final AdminAuthFilter adminAuthFilter;

    public SecurityConfig(
            JwtAuthFilter jwtAuthFilter,
            DoctorAuthFilter doctorAuthFilter,
            AdminAuthFilter adminAuthFilter
    ) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.doctorAuthFilter = doctorAuthFilter;
        this.adminAuthFilter = adminAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())

                .authorizeHttpRequests(auth -> auth
                        // 🔓 Swagger & OpenAPI (UI only)
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/actuator/**"
                        ).permitAll()

                        // 🔓 PUBLIC USER AUTH (MUST BE BEFORE /api/user/**)
                        .requestMatchers(
                                "/api/user/login",
                                "/api/user/register"
                        ).permitAll()

                        // 🔓 PUBLIC ADMIN / DOCTOR LOGIN
                        .requestMatchers(
                                "/api/admin/login",
                                "/api/doctor/login"
                        ).permitAll()

                        // 🔑 Admin handled by AdminAuthFilter
                        .requestMatchers("/api/admin/**").permitAll()

                        // Doctor protected
                        .requestMatchers("/api/doctor/**").permitAll()

                        // 🔑 USER MUST BE AUTHENTICATED
                        .requestMatchers("/api/user/**").authenticated()

                        .anyRequest().permitAll()

                )

                .addFilterBefore(adminAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(jwtAuthFilter, AdminAuthFilter.class)
                .addFilterBefore(doctorAuthFilter, UsernamePasswordAuthenticationFilter.class)

                .cors(Customizer.withDefaults());

        return http.build();
    }
}
