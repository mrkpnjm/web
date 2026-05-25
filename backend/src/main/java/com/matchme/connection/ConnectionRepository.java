package com.matchme.connection;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

@Repository
public interface ConnectionRepository extends JpaRepository<Connection, UUID> {

    // Target specific directional request (for example Alice requested Bob)
    Optional<Connection> findBySenderIdAndReceiverId(UUID senderId, UUID receiverId);

    // Target a relationship regardless of direction (for example are Alice and Bob connected at all?)
    @Query("SELECT c FROM Connection c WHERE " +
        "(c.senderId = :userA AND c.receiverId = :userB) OR " +
        "(c.senderId = :userB AND c.receiverId = :userA)")
    Optional<Connection> findConnectionBetweenUsers(@Param("userA") UUID userA, @Param("userB") UUID userB);
}