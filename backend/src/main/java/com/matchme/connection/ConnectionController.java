package com.matchme.connection;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.matchme.user.User;

@RestController
@RequestMapping("/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<UUID>> getActiveConnections(
        @AuthenticationPrincipal User loggedInUser) {
            return ResponseEntity.ok(connectionService.getActiveConnections(loggedInUser.getId()));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<UUID>> getPendingRequests(
        @AuthenticationPrincipal User loggedInUser) {
            return ResponseEntity.ok(connectionService.getPendingRequests(loggedInUser.getId()));
    }

    @PostMapping("/request")
    public ResponseEntity<Connection> sendRequest(
        @AuthenticationPrincipal User loggedInUser,
        @RequestParam UUID receiverId) {

        return ResponseEntity.ok(connectionService.sendRequest(loggedInUser.getId(), receiverId));
    }

    @PostMapping("/accept")
    public ResponseEntity<Connection> acceptRequest(
        @AuthenticationPrincipal User loggedInUser,
        @RequestParam UUID requesterId) { // Original sender of request

        // The logged-in user is the receiver accepting the request
        return ResponseEntity.ok(connectionService.acceptRequest(requesterId, loggedInUser.getId()));
    }

    @PutMapping("/dismiss")
    public ResponseEntity<Connection> dismissRequest(
        @AuthenticationPrincipal User loggedInUser,
        @RequestParam UUID requesterId) {

        // The logged-in user is the receiver dismissing the request
        return ResponseEntity.ok(connectionService.dismissRequest(requesterId, loggedInUser.getId()));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Connection> removeConnection(
        @AuthenticationPrincipal User loggedInUser,
        @RequestParam UUID connectedUserId) {

        // Order doesn't matter, checking both directions,
        // but passing logged-in user and the target user
        connectionService.removeConnection(loggedInUser.getId(), connectedUserId);
        return ResponseEntity.noContent().build();
    }
}