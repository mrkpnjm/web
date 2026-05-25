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
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId 
    @JoinColumn(name = "id")
    private User user;

    @Column(name = "display_name", nullable = false)
    private String displayName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "avatar_url")
    private String avatarUrl;

    @Column(name = "location_id")
    private Long locationId;

    private Integer age;
    private String gender;

    @Column(name = "music_genre")
    private String musicGenre;

    @Column(name = "looking_for")
    private String lookingFor;

    @Column(name = "activity_level")
    private String activityLevel;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
}