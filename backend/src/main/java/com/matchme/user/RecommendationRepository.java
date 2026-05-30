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
        WHERE u.id != :userId
        AND p.location_id = :locationId
        AND p.looking_for IS NOT NULL
        AND u.id NOT IN (SELECT dismissed_id FROM dismissed_recommendations WHERE user_id = :userId)
        AND u.id NOT IN (
            SELECT receiver_id FROM connections WHERE sender_id = :userId
            UNION
            SELECT sender_id FROM connections WHERE receiver_id = :userId
        )
        """, nativeQuery = true)
    List<UUID> findPotentialCandidates(@Param("userId") UUID userId, @Param("locationId") Long locationId);

    @Query(value = """
        SELECT DISTINCT u.id FROM users u
        JOIN profiles p ON u.id = p.id
        WHERE u.id != :userId
        AND p.latitude IS NOT NULL
        AND p.longitude IS NOT NULL
        AND p.looking_for IS NOT NULL
        AND u.id NOT IN (SELECT dismissed_id FROM dismissed_recommendations WHERE user_id = :userId)
        AND u.id NOT IN (
            SELECT receiver_id FROM connections WHERE sender_id = :userId
            UNION
            SELECT sender_id FROM connections WHERE receiver_id = :userId
        )
        AND (
            6371 * acos(
                LEAST(1.0,
                    cos(radians(CAST(:myLat AS float8))) * cos(radians(p.latitude)) *
                    cos(radians(p.longitude) - radians(CAST(:myLng AS float8))) +
                    sin(radians(CAST(:myLat AS float8))) * sin(radians(p.latitude))
                )
            ) <= CAST(:radiusKm AS float8)
        )
        """, nativeQuery = true)
    List<UUID> findCandidatesNearby(
        @Param("userId") UUID userId,
        @Param("myLat") double myLat,
        @Param("myLng") double myLng,
        @Param("radiusKm") int radiusKm
    );

    @Modifying
    @Transactional
    @Query(value = "INSERT INTO dismissed_recommendations (user_id, dismissed_id) VALUES (:userId, :dismissedId)", nativeQuery = true)
    void dismissRecommendation(@Param("userId") UUID userId, @Param("dismissedId") UUID dismissedId);
}