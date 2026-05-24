package com.matchme.seeder;

import com.matchme.user.User;
import com.matchme.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@Profile("seed")
@RequiredArgsConstructor
public class Seeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String PASSWORD_HASH = null; // set on init
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

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            System.out.println("Database already has users, skipping seed.");
            return;
        }

        String hashedPassword = passwordEncoder.encode("password123");
        List<User> users = new ArrayList<>();

        for (int i = 0; i < USER_COUNT; i++) {
            String firstName = FIRST_NAMES[i % FIRST_NAMES.length];
            String lastName = LAST_NAMES[i % LAST_NAMES.length];
            String domain = DOMAINS[i % DOMAINS.length];
            String email = (firstName + "." + lastName + i + "@" + domain).toLowerCase();

            User user = new User();
            user.setEmail(email);
            user.setPasswordHash(hashedPassword);
            users.add(user);
        }

        userRepository.saveAll(users);
        System.out.println("Seeded " + USER_COUNT + " users. Password for all: password123");
    }
}
