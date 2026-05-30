package com.matchme.user;

import com.matchme.connection.ConnectionRepository;
import com.matchme.connection.ConnectionStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final ConnectionRepository connectionRepository;
    private final RecommendationRepository recommendationRepository;

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
        profile.setLatitude(updatedData.getLatitude());
        profile.setLongitude(updatedData.getLongitude());
        if (updatedData.getMaxRadiusKm() != null) {
            profile.setMaxRadiusKm(updatedData.getMaxRadiusKm());
        }

        Profile saved = profileRepository.save(profile);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/me/profile")
    public ResponseEntity<Map<String, Object>> getMyProfile(@AuthenticationPrincipal User me) {
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not setup yet"));
        
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", profile.getId());
        response.put("display_name", profile.getDisplayName());
        response.put("avatar_url", profile.getAvatarUrl());
        response.put("about_me", profile.getBio());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/{id}/profile")
    public ResponseEntity<Map<String, Object>> getUserProfile(@AuthenticationPrincipal User me, @PathVariable UUID id) {
        checkAccess(me.getId(), id);
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
                
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", profile.getId());
        response.put("display_name", profile.getDisplayName());
        response.put("avatar_url", profile.getAvatarUrl());
        response.put("about_me", profile.getBio()); 
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/bio")
    public ResponseEntity<Map<String, Object>> getMyBio(@AuthenticationPrincipal User me) {
        Profile profile = profileRepository.findById(me.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not setup yet"));
        return ResponseEntity.ok(mapBioData(profile));
    }

    @GetMapping("/users/{id}/bio")
    public ResponseEntity<Map<String, Object>> getUserBio(@AuthenticationPrincipal User me, @PathVariable UUID id) {
        checkAccess(me.getId(), id);
        Profile profile = profileRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found"));
        return ResponseEntity.ok(mapBioData(profile));
    }

    private void checkAccess(UUID myId, UUID targetId) {
        if (myId.equals(targetId)) return;

        var connection = connectionRepository.findConnectionBetweenUsers(myId, targetId);
        if (connection.isPresent()) {
            ConnectionStatus status = connection.get().getStatus();
            if (status == ConnectionStatus.ACCEPTED || status == ConnectionStatus.PENDING) return;
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }

        Profile myProfile = profileRepository.findById(myId).orElse(null);
        if (myProfile == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }

        boolean isCandidate;
        if (myProfile.getLatitude() != null && myProfile.getLongitude() != null && myProfile.getMaxRadiusKm() != null) {
            isCandidate = recommendationRepository
                    .findCandidatesNearby(myId, myProfile.getLatitude(), myProfile.getLongitude(), myProfile.getMaxRadiusKm())
                    .contains(targetId);
        } else if (myProfile.getLocationId() != null) {
            isCandidate = recommendationRepository
                    .findPotentialCandidates(myId, myProfile.getLocationId())
                    .contains(targetId);
        } else {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }

        if (!isCandidate) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile not found");
        }
    }

    private Map<String, Object> mapBioData(Profile profile) {
        Map<String, Object> bioData = new LinkedHashMap<>();
        bioData.put("id", profile.getId());
        bioData.put("location_id", profile.getLocationId());
        bioData.put("age", profile.getAge());
        bioData.put("gender", profile.getGender());
        bioData.put("music_genre", profile.getMusicGenre());
        bioData.put("looking_for", profile.getLookingFor());
        bioData.put("activity_level", profile.getActivityLevel());
        bioData.put("latitude", profile.getLatitude());
        bioData.put("longitude", profile.getLongitude());
        bioData.put("max_radius_km", profile.getMaxRadiusKm());
        return bioData;
    }
}