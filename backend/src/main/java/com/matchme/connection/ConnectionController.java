package com.matchme.connection;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/connections")
public class ConnectionController {

    private final ConnectionService connectionService;

    public ConnectionController(ConnectionService connectionService) {
        this.connectionService = connectionService;
    }

    @PostMapping("/request")
    public ResponseEntity<Connection> sendRequest(@RequestParam UUID senderId, @RequestParam UUID receiverId) {
        return ResponseEntity.ok(connectionService.sendRequest(senderId, receiverId));
    }

    @PostMapping("/accept")
    public ResponseEntity<Connection> acceptRequest(@RequestParam UUID senderId, @RequestParam UUID receiverId) {
        return ResponseEntity.ok(connectionService.acceptRequest(senderId, receiverId));
    }

    @PutMapping("/dismiss")
    public ResponseEntity<Connection> dismissRequest(@RequestParam UUID senderId, @RequestParam UUID receiverId) {
        return ResponseEntity.ok(connectionService.dismissRequest(senderId, receiverId));
    }

    @DeleteMapping("/remove")
    public ResponseEntity<Connection> removeConnection(@RequestParam UUID senderId, @RequestParam UUID receiverId) {
        connectionService.removeConnection(senderId, receiverId);
        return ResponseEntity.noContent().build();
    }
}