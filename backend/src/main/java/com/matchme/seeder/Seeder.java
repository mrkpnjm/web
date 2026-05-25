package com.matchme.seeder;

import com.matchme.user.Interest;
import com.matchme.user.InterestRepository;
import com.matchme.user.Location;
import com.matchme.user.LocationRepository;
import com.matchme.user.ProfileRepository;
import com.matchme.user.User;
import com.matchme.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class Seeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final LocationRepository locationRepository;
    private final InterestRepository interestRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int USER_COUNT = 100;

    private static final String[] FIRST_NAMES = {
        "Alice", "Bob", "Charlie", "Diana", "Emma", "Frank", "Grace", "Henry",
        "Isla", "Jack", "Kate", "Liam", "Mia", "Noah", "Olivia", "Paul",
        "Quinn", "Rachel", "Sam", "Tina", "Uma", "Victor", "Wendy", "Xander",
        "Yara", "Zoe", "Adam", "Beth", "Carl", "Dora"
    };

    private static final String[] LAST_NAMES = {
        "Smith", "Jones", "Williams", "Brown", "Taylor", "Davies", "Wilson",
        "Evans", "Thomas", "Roberts", "Johnson", "Walker", "Wright", "Robinson",
        "Thompson", "White", "Hughes", "Edwards", "Green", "Hall"
    };

    private static final String[] DOMAINS = {
        "gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "mail.com"
    };

    private static final String[] GENDERS = { "male", "female", "non-binary" };

    private static final String[] MUSIC_GENRES = {
        "rock", "pop", "jazz", "classical", "hip-hop", "electronic", "country", "r&b"
    };

    private static final String[] LOOKING_FOR = {
        "friendship", "romance", "adventure", "professional"
    };

    private static final String[] ACTIVITY_LEVELS = { "low", "moderate", "high" };

    private static final String[] INTEREST_OPTIONS = {
        "reading", "gaming", "hiking", "cooking", "traveling", "sports",
        "photography", "art", "music", "movies", "fitness", "coding",
        "dancing", "yoga", "cycling", "gardening", "writing", "crafts"
    };

    private static final String[][] LOCATIONS = {
        {"Tallinn", "Estonia"}, {"Tartu", "Estonia"}, {"Narva", "Estonia"},
        {"Helsinki", "Finland"}, {"Riga", "Latvia"}, {"Vilnius", "Lithuania"},
        {"Stockholm", "Sweden"}, {"Berlin", "Germany"}, {"London", "UK"},
        {"Amsterdam", "Netherlands"}
    };

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("Database already has users, skipping seed.");
            return;
        }

        Random rng = new Random(42);
        String hashedPassword = passwordEncoder.encode("password123");

        // Seed locations
        List<Location> locations = new ArrayList<>();
        for (String[] loc : LOCATIONS) {
            Location l = new Location();
            l.setCity(loc[0]);
            l.setCountry(loc[1]);
            locations.add(l);
        }
        locationRepository.saveAll(locations);

        // Seed users + profiles + interests
        for (int i = 0; i < USER_COUNT; i++) {
            String firstName = FIRST_NAMES[i % FIRST_NAMES.length];
            String lastName = LAST_NAMES[i % LAST_NAMES.length];
            String domain = DOMAINS[i % DOMAINS.length];
            String email = (firstName + "." + lastName + i + "@" + domain).toLowerCase();

            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(hashedPassword);
            userRepository.save(user);

            Location loc = locations.get(rng.nextInt(locations.size()));

            com.matchme.user.Profile profile = new com.matchme.user.Profile();
            profile.setUser(user);
            profile.setDisplayName(firstName + " " + lastName);
            profile.setBio("Hi, I'm " + firstName + ". I love meeting new people.");
            profile.setAge(18 + rng.nextInt(43));
            profile.setGender(GENDERS[rng.nextInt(GENDERS.length)]);
            profile.setMusicGenre(MUSIC_GENRES[rng.nextInt(MUSIC_GENRES.length)]);
            profile.setLookingFor(LOOKING_FOR[rng.nextInt(LOOKING_FOR.length)]);
            profile.setActivityLevel(ACTIVITY_LEVELS[rng.nextInt(ACTIVITY_LEVELS.length)]);
            profile.setLocationId(loc.getId());
            profileRepository.save(profile);

            // 2-4 random interests per user
            int interestCount = 2 + rng.nextInt(3);
            List<String> chosen = new ArrayList<>();
            for (int j = 0; j < interestCount; j++) {
                String interest = INTEREST_OPTIONS[rng.nextInt(INTEREST_OPTIONS.length)];
                if (!chosen.contains(interest)) {
                    chosen.add(interest);
                    Interest it = new Interest();
                    it.setUser(user);
                    it.setInterest(interest);
                    interestRepository.save(it);
                }
            }
        }

        System.out.println("Seeded " + USER_COUNT + " users with profiles. Password for all: password123");
    }
}
