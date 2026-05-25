package com.matchme.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;

    @PutMapping("/me/profile")
    public ResponseEntity<Profile> updateMyProfile(@AuthenticationPrincipal User me, @RequestBody Profile updatedData) {
        Profile profile = profileRepository.findById(me.getId()).orElse(new Profile());

        profile.setUser(me);
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

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<Profile> getUserProfile(@PathVariable UUID id) {
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return ResponseEntity.ok(profile);
    }
}