package com.matchme.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal User me) {
        return ResponseEntity.ok(Map.of(
                "id", me.getId(),
                "email", me.getEmail(),
                "name", me.getEmail(),
                "profile_picture", ""
        ));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable UUID id) {
        return userRepository.findById(id)
                .map(u -> ResponseEntity.ok(Map.<String, Object>of(
                        "id", u.getId(),
                        "name", u.getEmail(),
                        "profile_picture", ""
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
