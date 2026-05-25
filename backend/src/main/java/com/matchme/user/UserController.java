package com.matchme.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal User me) {
        Optional<Profile> profile = profileRepository.findById(me.getId());
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", me.getId());
        response.put("email", me.getEmail());
        response.put("name", profile.map(Profile::getDisplayName).orElse(me.getEmail()));
        response.put("profile_picture", profile.map(Profile::getAvatarUrl).orElse(null));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable UUID id) {
        return userRepository.findById(id).map(u -> {
            Optional<Profile> profile = profileRepository.findById(id);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("id", u.getId());
            response.put("name", profile.map(Profile::getDisplayName).orElse(u.getEmail()));
            response.put("profile_picture", profile.map(Profile::getAvatarUrl).orElse(null));
            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}
