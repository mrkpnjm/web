package com.matchme.user;

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

    // ----------------------------------------------------
    // 1. CREATE / UPDATE MY PROFILE
    // ----------------------------------------------------
    @PutMapping("/me/profile")
    public ResponseEntity<Profile> updateMyProfile(@AuthenticationPrincipal User me, @RequestBody Profile updatedData) {
        // Fetch existing or create a new one
        Profile profile = profileRepository.findById(me.getId()).orElse(new Profile());
        
        profile.setUser(me);
        profile.setDisplayName(updatedData.getDisplayName());
        profile.setBio(updatedData.getBio());
        profile.setLookingFor(updatedData.getLookingFor());
        profile.setActivityLevel(updatedData.getActivityLevel());
        profile.setSocialPreference(updatedData.getSocialPreference());
        profile.setCommunicationStyle(updatedData.getCommunicationStyle());
        profile.setPrimaryInterest(updatedData.getPrimaryInterest());
        
        // Save to DB
        Profile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    // ----------------------------------------------------
    // 2. GET MY PROFILE
    // ----------------------------------------------------
    @GetMapping("/me/profile")
    public ResponseEntity<Profile> getMyProfile(@AuthenticationPrincipal User me) {
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not setup yet"));
        return ResponseEntity.ok(profile);
    }

    // ----------------------------------------------------
    // 3. GET ANOTHER USER'S PROFILE (For matches)
    // ----------------------------------------------------
    @GetMapping("/users/{id}/profile")
    public ResponseEntity<Profile> getUserProfile(@PathVariable UUID id) {
        // TODO: Later, add the rule that checks if they are a recommended match!
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return ResponseEntity.ok(profile);
    }
}