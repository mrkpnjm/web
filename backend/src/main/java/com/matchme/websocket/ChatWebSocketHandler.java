package com.matchme.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.matchme.chat.Message;
import com.matchme.chat.MessageRepository;
import com.matchme.connection.ConnectionRepository;
import com.matchme.connection.ConnectionStatus;
import com.matchme.security.JwtUtil;
import com.matchme.user.User;
import com.matchme.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
@RequiredArgsConstructor
public class ChatWebSocketHandler extends TextWebSocketHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;
    private final MessageRepository messageRepository;
    private final ConnectionRepository connectionRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final Map<UUID, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        UUID userId = getUserId(session);
        if (userId == null) { closeSession(session); return; }
        sessions.put(userId, session);

        // Tell the newly connected user which other users are already online
        for (UUID onlineId : sessions.keySet()) {
            if (!onlineId.equals(userId)) {
                try {
                    send(userId, Map.of("type", "online", "userId", onlineId, "online", true));
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }

        broadcast(Map.of("type", "online", "userId", userId, "online", true));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage textMessage) throws Exception {
        UUID senderId = getUserId(session);
        if (senderId == null) return;

        Map<?, ?> msg = objectMapper.readValue(textMessage.getPayload(), Map.class);
        String type = (String) msg.get("type");

        if ("message".equals(type)) {
            handleMessage(senderId, msg);
        } else if ("typing".equals(type)) {
            handleTyping(senderId, msg);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        UUID userId = getUserId(session);
        if (userId != null) {
            sessions.remove(userId);
            broadcast(Map.of("type", "online", "userId", userId, "online", false));
        }
    }

    private void handleMessage(UUID senderId, Map<?, ?> msg) throws Exception {
        String toStr = (String) msg.get("to");
        String content = (String) msg.get("content");
        if (toStr == null || content == null) return;

        UUID receiverId = UUID.fromString(toStr);
        User sender = userRepository.findById(senderId).orElse(null);
        User receiver = userRepository.findById(receiverId).orElse(null);
        if (sender == null || receiver == null) return;

        boolean connected = connectionRepository.findConnectionBetweenUsers(senderId, receiverId)
                .filter(c -> c.getStatus() == ConnectionStatus.ACCEPTED)
                .isPresent();
        if (!connected) return;

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        messageRepository.save(message);

        Map<String, Object> payload = Map.of("type", "message", "message", Map.of(
                "id", message.getId(),
                "sender_id", senderId,
                "receiver_id", receiverId,
                "content", content,
                "read", false,
                "created_at", message.getCreatedAt().toString()
        ));
        send(senderId, payload);
        send(receiverId, payload);
    }

    private void handleTyping(UUID from, Map<?, ?> msg) throws Exception {
        String toStr = (String) msg.get("to");
        if (toStr == null) return;
        UUID to = UUID.fromString(toStr);
        send(to, Map.of("type", "typing", "from", from, "isTyping", msg.get("isTyping")));
    }

    private void send(UUID userId, Object payload) throws Exception {
        WebSocketSession session = sessions.get(userId);
        if (session != null && session.isOpen()) {
            // Lock the session so only one thread can send a message to this user at a time
            synchronized (session) {
                if (session.isOpen()) { // Double-check it's still open inside the lock
                    session.sendMessage(new TextMessage(objectMapper.writeValueAsString(payload)));
                }
            }
        }
    }

    private void broadcast(Object payload) {
        try {
            String json = objectMapper.writeValueAsString(payload);
            for (WebSocketSession s : sessions.values()) {
                // Lock each individual session as we broadcast to it
                synchronized (s) {
                    if (s.isOpen()) {
                        s.sendMessage(new TextMessage(json));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private UUID getUserId(WebSocketSession session) {
        String query = session.getUri() != null ? session.getUri().getQuery() : null;
        if (query == null) return null;
        String token = Arrays.stream(query.split("&"))
                .filter(p -> p.startsWith("token="))
                .map(p -> p.substring(6))
                .findFirst().orElse(null);
        if (token == null || !jwtUtil.isValid(token)) return null;
        return jwtUtil.extractUserId(token);
    }

    private void closeSession(WebSocketSession session) {
        try { session.close(CloseStatus.NOT_ACCEPTABLE); } catch (Exception ignored) {}
    }
}