package com.matchme.connection;

import java.util.List;
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

    // Find active connections where the user is either the sender or receiver
    @Query("SELECT c FROM Connection c WHERE " +
        "c.status = 'ACCEPTED' AND " +
        "(c.senderId = :userId OR c.receiverId = :userId)")
    List<Connection> findActiveConnections(@Param("userId") UUID userId);

    // Find incoming pending requests specifically waiting for this user to accept
    List<Connection> findByReceiverIdAndStatus(UUID receiverId, ConnectionStatus status);
}