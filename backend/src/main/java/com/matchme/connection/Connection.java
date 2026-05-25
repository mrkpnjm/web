package com.matchme.connection;

import jakarta.persistence.*;
import java.util.UUID;
import java.time.Instant;

@Entity
@Table(
    name = "connections",
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_conn_sender_receiver",columnNames = {"sender_id", "receiver_id"})
    }
)

public class Connection {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "sender_id", nullable = false)
    private UUID senderId;

    @Column(name = "receiver_id", nullable = false)
    private UUID receiverId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private ConnectionStatus status;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = Instant.now();
        }
    }

    public Connection() {}

    public Connection(UUID senderId, UUID receiverId, ConnectionStatus status) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.status = status;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getSenderId() { return senderId; }
    public void setSenderId(UUID senderId) { this.senderId = senderId; }

    public UUID getReceiverId() { return receiverId; }
    public void setReceiverId(UUID receiverId) { this.receiverId = receiverId; }

    public ConnectionStatus getStatus() { return status; }
    public void setStatus(ConnectionStatus status) { this.status = status; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}