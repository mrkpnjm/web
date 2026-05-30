/* This is the core "Scorer". It takes the city-filtered list from the database,
enforces the "completed profile" rule, scores the remaining users to weed out
obviously poor matches, and returns exactly the top 10 IDs.

Scoring factors (higher = better match):
  - looking_for mismatch     → -1  (hard reject, obviously poor match)
  - shared music genre       → +10
  - shared activity level    → +5
  - per shared interest      → +3 each
  - age difference ≤3 yrs    → +5
  - age difference ≤7 yrs    → +3
  - age difference ≤15 yrs   → +1
  - compatible but no match  → +1 (base score so they still appear)
*/

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
    private final InterestRepository interestRepository;

    public List<UUID> getRecommendations(User me) {
        Profile myProfile = profileRepository.findById(me.getId()).orElse(null);
        
        // Requirement: No recommendations until profile is completed
        if (myProfile == null || myProfile.getLocationId() == null || myProfile.getLookingFor() == null) {
            return List.of();
        }

        // 1. Get candidates filtered by proximity (Haversine) or city fallback
        List<UUID> candidateIds;
        if (myProfile.getLatitude() != null && myProfile.getLongitude() != null && myProfile.getMaxRadiusKm() != null) {
            candidateIds = recommendationRepository.findCandidatesNearby(
                    me.getId(), myProfile.getLatitude(), myProfile.getLongitude(), myProfile.getMaxRadiusKm());
        } else if (myProfile.getLocationId() != null) {
            candidateIds = recommendationRepository.findPotentialCandidates(me.getId(), myProfile.getLocationId());
        } else {
            return List.of();
        }

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

        // Hard reject: incompatible intentions are an obviously poor match
        if (me.getLookingFor() != null && other.getLookingFor() != null
                && !me.getLookingFor().equalsIgnoreCase(other.getLookingFor())) {
            return -1.0;
        }

        // Music genre compatibility
        if (me.getMusicGenre() != null && me.getMusicGenre().equalsIgnoreCase(other.getMusicGenre())) {
            score += 10.0;
        }

        // Activity level compatibility
        if (me.getActivityLevel() != null && me.getActivityLevel().equalsIgnoreCase(other.getActivityLevel())) {
            score += 5.0;
        }

        // Shared interests (+3 per shared interest)
        List<String> myInterests = interestRepository.findByUser_Id(me.getId())
                .stream().map(Interest::getInterest).toList();
        List<String> otherInterests = interestRepository.findByUser_Id(other.getId())
                .stream().map(Interest::getInterest).toList();
        long sharedInterests = myInterests.stream().filter(otherInterests::contains).count();
        score += sharedInterests * 3.0;

        // Age compatibility
        if (me.getAge() != null && other.getAge() != null) {
            int ageDiff = Math.abs(me.getAge() - other.getAge());
            if (ageDiff <= 3)       score += 5.0;
            else if (ageDiff <= 7)  score += 3.0;
            else if (ageDiff <= 15) score += 1.0;
        }

        // Base score: compatible but no specific overlap — still a valid candidate
        if (score == 0) score = 1.0;

        return score;
    }

    // Helper record to hold the score during the sorting stream
    private record MatchScore(UUID userId, double score) {}
}