package com.matchme.user;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
@Data
@NoArgsConstructor
public class Profile {

    @Id
    private UUID id; // This shares the ID with the User table

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId // Tells Hibernate to use the User's ID as the Profile's ID
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "display_name")
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    // We can store the country as a simple string to skip the Location join for now, 
    // or map it to a Location entity if you strictly want to use the locations table.
    // For maximum speed right now, let's treat locationId as a basic reference.
    
    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "looking_for")
    private String lookingFor;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(name = "social_preference")
    private String socialPreference;

    @Column(name = "communication_style")
    private String communicationStyle;

    @Column(name = "primary_interest")
    private String primaryInterest;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}