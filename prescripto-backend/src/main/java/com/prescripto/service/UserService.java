package com.prescripto.service;

import com.cloudinary.Cloudinary;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.prescripto.dto.LoginRequest;
import com.prescripto.dto.RegisterRequest;
import com.prescripto.dto.UpdateProfileRequest;
import com.prescripto.dto.UserResponse;
import com.prescripto.model.User;
import com.prescripto.redis.RedisKeys;
import com.prescripto.redis.RedisService;
import com.prescripto.repository.UserRepository;
import com.prescripto.security.JwtUtil;
import com.prescripto.util.PasswordUtil;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final CloudinaryService cloudinaryService;
    private final RedisService redisService;


    public UserService(
            UserRepository userRepository,
            JwtUtil jwtUtil,
            CloudinaryService cloudinaryService,
            RedisService redisService
    ) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.cloudinaryService = cloudinaryService;
        this.redisService = redisService;
    }

    // REGISTER
    public String register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(PasswordUtil.hash(request.getPassword()));

        userRepository.save(user);

        return jwtUtil.generateToken(user.getId());
    }

    // LOGIN
    public String login(LoginRequest request) {

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!PasswordUtil.match(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(user.getId());
    }

    // GET PROFILE (NO PASSWORD)
    public UserResponse getProfile(String userId) {

        String key = RedisKeys.userProfile(userId);

        // 🔴 REDIS READ
        String cached = redisService.get(key);
        if (cached != null) {
            try {
                return new ObjectMapper()
                        .readValue(cached, UserResponse.class);
            } catch (Exception ignored) {}
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserResponse res = toResponse(user);

        // 🔴 REDIS WRITE
        try {
            redisService.set(
                    key,
                    new ObjectMapper().writeValueAsString(res),
                    600
            );
        } catch (Exception ignored) {}

        return res;
    }

    // UPDATE PROFILE + IMAGE
    public UserResponse updateProfile(
            String userId,
            UpdateProfileRequest request,
            MultipartFile image
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getGender() != null) user.setGender(request.getGender());
        if (request.getDob() != null) user.setDob(request.getDob());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

        if (image != null && !image.isEmpty()) {
            String imageUrl =
                    cloudinaryService.upload(image, "prescripto/users");
            user.setImage(imageUrl);
        }

        userRepository.save(user);

        // 🔴 REDIS INVALIDATION
        redisService.delete(RedisKeys.userProfile(userId));
        return toResponse(user);
    }

    // COMMON RESPONSE MAPPER
    private UserResponse toResponse(User user) {
        UserResponse res = new UserResponse();
        res.setId(user.getId());
        res.setName(user.getName());
        res.setEmail(user.getEmail());
        res.setImage(user.getImage());
        res.setAddress(user.getAddress());
        res.setGender(user.getGender());
        res.setDob(user.getDob());
        res.setPhone(user.getPhone());
        return res;
    }
}
