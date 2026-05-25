// Logic for React frontend (requirement that endpoints return just IDs).

package com.matchme.user;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<UUID>> getRecommendations(@AuthenticationPrincipal User me) {
        List<UUID> recommendations = recommendationService.getRecommendations(me);
        return ResponseEntity.ok(recommendations);
    }

    @PostMapping("/{dismissedId}/dismiss")
    public ResponseEntity<Void> dismissRecommendation(@AuthenticationPrincipal User me, @PathVariable UUID dismissedId) {
        recommendationService.dismiss(me.getId(), dismissedId);
        return ResponseEntity.ok().build();
    }
}