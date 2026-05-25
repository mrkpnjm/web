/* This file acts as the "Hard Filter". It uses a native PostgreSQL query to filter out users that the current user 
should absolutely never see, saving Java server from processing heavy data. It also includes a method to handle the dismissals. */

package com.matchme.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface RecommendationRepository extends JpaRepository<User, UUID> {

    @Query(value = """
        SELECT DISTINCT u.id FROM users u
        JOIN profiles p ON u.id = p.id
        JOIN locations l ON p.location_id = l.id
        WHERE u.id != :userId
        AND l.country = (SELECT country FROM locations WHERE id = :locationId)
        AND u.id NOT IN (SELECT dismissed_id FROM dismissed_recommendations WHERE user_id = :userId)
        AND u.id NOT IN (
            SELECT receiver_id FROM connections WHERE sender_id = :userId 
            UNION 
            SELECT sender_id FROM connections WHERE receiver_id = :userId
        )
        """, nativeQuery = true)
    List<UUID> findPotentialCandidates(@Param("userId") UUID userId, @Param("locationId") Long locationId);

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO dismissed_recommendations (user_id, dismissed_id) VALUES (:userId, :dismissedId)", nativeQuery = true)
    void dismissRecommendation(@Param("userId") UUID userId, @Param("dismissedId") UUID dismissedId);
}