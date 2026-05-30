package com.matchme.user;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterestRepository extends JpaRepository<Interest, Long> {
    List<Interest> findByUser(User user);
    List<Interest> findByUser_Id(java.util.UUID userId);
}
