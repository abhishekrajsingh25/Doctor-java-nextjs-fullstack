package com.prescripto.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prescripto.dto.LoginRequest;
import com.prescripto.dto.RegisterRequest;
import com.prescripto.dto.UpdateProfileRequest;
import com.prescripto.security.CustomUserDetails;
import com.prescripto.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@SecurityRequirement(name = "UserAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // REGISTER
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody RegisterRequest request) {
        return Map.of(
                "success", true,
                "token", userService.register(request)
        );
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        return Map.of(
                "success", true,
                "token", userService.login(request)
        );
    }

    // GET PROFILE
    @GetMapping("/get-profile")
    public Map<String, Object> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return Map.of(
                "success", true,
                "user", userService.getProfile(userDetails.getUserId())
        );
    }

    // UPDATE PROFILE + IMAGE
    @PutMapping(
            value = "/update-profile",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, Object> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestPart("data") String data,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws Exception {

        ObjectMapper mapper = new ObjectMapper();
        UpdateProfileRequest request =
                mapper.readValue(data, UpdateProfileRequest.class);

        return Map.of(
                "success", true,
                "user", userService.updateProfile(
                        userDetails.getUserId(),
                        request,
                        image
                )
        );
    }


}
