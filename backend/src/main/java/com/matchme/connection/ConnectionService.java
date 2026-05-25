package com.matchme.connection;

import java.util.UUID;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

@Service
public class ConnectionService {

    private final ConnectionRepository connectionRepository;

    public ConnectionService(ConnectionRepository connectionRepository) {
        this.connectionRepository = connectionRepository;
    }

    @Transactional
    public Connection sendRequest(UUID senderId, UUID receiverId) {
        if (senderId.equals(receiverId)) {
            throw new IllegalArgumentException("You cannot send a connection request to yourself!");
        }

        connectionRepository.findConnectionBetweenUsers(senderId, receiverId).ifPresent(existing -> {
            throw new IllegalStateException("A relationship already exists between these users with status: " + existing.getStatus());
        });

        Connection connection = new Connection(senderId, receiverId, ConnectionStatus.PENDING);
        return connectionRepository.save(connection);
    }

    @Transactional
    public Connection acceptRequest(UUID senderId, UUID receiverId) {
        Connection connection = connectionRepository.findBySenderIdAndReceiverId(senderId, receiverId)
            .orElseThrow(() -> new IllegalArgumentException("No connection request found!"));
        
        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new IllegalStateException("Only PENDING request can be accepted!");
        }

        connection.setStatus(ConnectionStatus.ACCEPTED);
        return connectionRepository.save(connection);
    }

    @Transactional
    public Connection dismissRequest(UUID senderId, UUID receiverId) {
        Connection connection = connectionRepository.findBySenderIdAndReceiverId(senderId, receiverId)
            .orElseThrow(() -> new IllegalArgumentException("No connection request found!"));
        
        if (connection.getStatus() != ConnectionStatus.PENDING) {
            throw new IllegalStateException("Only PENDING request can be dismissed!");
        }

        connection.setStatus(ConnectionStatus.DECLINED);
        return connectionRepository.save(connection);
    }

    @Transactional
    public void removeConnection(UUID userId, UUID connectedUserId) {
        Connection connection = connectionRepository.findConnectionBetweenUsers(userId, connectedUserId)
            .orElseThrow(() -> new IllegalArgumentException("No active connection found!"));

        if (connection.getStatus() != ConnectionStatus.ACCEPTED) {
            throw new IllegalStateException("Users are not actively connected!");
        }
        connectionRepository.delete(connection);
    }
}