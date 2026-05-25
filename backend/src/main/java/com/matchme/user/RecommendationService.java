/* This is the core "Scorer". It takes the filtered list from the database, 
enforces the "completed profile" rule, scores the remaining users to weed out 
obviously poor matches, and returns exactly the top 10 IDs. */

package com.matchme.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationRepository recommendationRepository;
    private final ProfileRepository profileRepository;

    public List<UUID> getRecommendations(User me) {
        Profile myProfile = profileRepository.findById(me.getId()).orElse(null);
        
        // Requirement: No recommendations until profile is completed
        if (myProfile == null || myProfile.getLocationId() == null || myProfile.getLookingFor() == null) {
            return List.of();
        }

        // 1. Get location-filtered candidates from DB
        
        List<UUID> candidateIds = recommendationRepository.findPotentialCandidates(me.getId(), myProfile.getLocationId());

        // 2. Score, sort, and limit candidates
        return candidateIds.stream()
                .map(id -> {
                    Profile otherProfile = profileRepository.findById(id).orElse(null);
                    if (otherProfile == null) return new MatchScore(id, -1);
                    return new MatchScore(id, calculateScore(myProfile, otherProfile));
                })
                .filter(match -> match.score() > 0) // Requirement: Avoid obviously poor matches
                .sorted(Comparator.comparingDouble(MatchScore::score).reversed())
                .limit(10) // Requirement: Max 10 recommendations at a time
                .map(MatchScore::userId)
                .toList();
    }

    public void dismiss(UUID myId, UUID dismissedId) {
        recommendationRepository.dismissRecommendation(myId, dismissedId);
    }

    private double calculateScore(Profile me, Profile other) {
        double score = 0;

        // "Obviously poor match" filter - if they want completely different things
        if (me.getLookingFor() != null && other.getLookingFor() != null 
            && !me.getLookingFor().equalsIgnoreCase(other.getLookingFor())) {
            return -1.0; 
        }

        // Prioritization scoring
        if (me.getMusicGenre() != null && me.getMusicGenre().equalsIgnoreCase(other.getMusicGenre())) {
            score += 10.0;
        }
        if (me.getActivityLevel() != null && me.getActivityLevel().equalsIgnoreCase(other.getActivityLevel())) {
            score += 5.0;
        }
        
        // Bonus points for being in the exact same city
        if (me.getLocationId() != null && me.getLocationId().equals(other.getLocationId())) {
            score += 5.0; 
        }

        // Base score for simply existing in the same country with compatible 'looking_for'
        if (score == 0) score = 1.0;

        return score;
    }

    // Helper record to hold the score during the sorting stream
    private record MatchScore(UUID userId, double score) {}
}