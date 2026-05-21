package com.matchme.chat;

import com.matchme.user.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

    @Query("SELECT m FROM Message m WHERE (m.sender = :a AND m.receiver = :b) OR (m.sender = :b AND m.receiver = :a) ORDER BY m.createdAt DESC")
    List<Message> findConversation(User a, User b, Pageable pageable);

    @Query("SELECT m FROM Message m WHERE m.sender = :user OR m.receiver = :user ORDER BY m.createdAt DESC")
    List<Message> findAllByUser(User user);

    @Modifying
    @Query("UPDATE Message m SET m.read = true WHERE m.sender = :sender AND m.receiver = :receiver AND m.read = false")
    void markAsRead(User sender, User receiver);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.receiver = :user AND m.read = false AND m.sender = :other")
    long countUnread(User user, User other);
}
