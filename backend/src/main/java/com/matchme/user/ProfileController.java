package com.matchme.user;

import com.matchme.connection.ConnectionRepository;
import com.matchme.connection.ConnectionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository; 
    private final ConnectionRepository connectionRepository;

    @PutMapping("/me/profile")
    public ResponseEntity<Profile> updateMyProfile(@AuthenticationPrincipal User me, @RequestBody Profile updatedData) {
        Profile profile = profileRepository.findById(me.getId()).orElse(new Profile());

        User attachedUser = userRepository.findById(me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        profile.setUser(attachedUser); 
        profile.setDisplayName(updatedData.getDisplayName());
        profile.setBio(updatedData.getBio());
        profile.setAvatarUrl(updatedData.getAvatarUrl());
        profile.setLocationId(updatedData.getLocationId());
        profile.setAge(updatedData.getAge());
        profile.setGender(updatedData.getGender());
        profile.setMusicGenre(updatedData.getMusicGenre());
        profile.setLookingFor(updatedData.getLookingFor());
        profile.setActivityLevel(updatedData.getActivityLevel());
        
        Profile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/me/profile")
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal User me) {
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not setup yet"));
        return ResponseEntity.ok(profile);
    }

    // Endpoint for my bio
    @GetMapping("/me/bio")
    public ResponseEntity<Map<String, String>> getMyBio(@AuthenticationPrincipal User me) {
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not setup yet"));
        return ResponseEntity.ok(Map.of("bio", profile.getBio() != null ? profile.getBio() : ""));
    }

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<Profile> getUserProfile(@AuthenticationPrincipal User me, @PathVariable UUID id) {
        // Check if request is made by someone else
        if (!me.getId().equals(id)) {
            var connection = connectionRepository.findConnectionBetweenUsers(me.getId(), id);
            
            // If a connection exists but was DECLINED, block access (404)
            if (connection.isPresent() && connection.get().getStatus() == ConnectionStatus.DECLINED) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unauthorized: Profile unavailable");
            }
        }

        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return ResponseEntity.ok(profile);
    }

    // Bio endpoint
    @GetMapping("/users/{id}/bio")
    public ResponseEntity<Map<String, String>> getUserBio(@AuthenticationPrincipal User me, @PathVariable UUID id) {
        if (!me.getId().equals(id)) {
            var connection = connectionRepository.findConnectionBetweenUsers(me.getId(), id);
            
            if (connection.isPresent() && connection.get().getStatus() == ConnectionStatus.DECLINED) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Unauthorized: Profile unavailable");
            }
        }

        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return ResponseEntity.ok(Map.of("bio", profile.getBio() != null ? profile.getBio() : ""));
    }
}