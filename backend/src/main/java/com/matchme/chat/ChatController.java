package com.matchme.chat;

import com.matchme.user.User;
import com.matchme.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private static final int PAGE_SIZE = 30;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getChats(@AuthenticationPrincipal User me) {
        List<Message> all = messageRepository.findAllByUser(me);
        Map<UUID, Map<String, Object>> chatMap = new LinkedHashMap<>();

        for (Message m : all) {
            UUID otherId = m.getSender().getId().equals(me.getId())
                    ? m.getReceiver().getId()
                    : m.getSender().getId();
            if (!chatMap.containsKey(otherId)) {
                long unread = messageRepository.countUnread(me, m.getSender().getId().equals(me.getId()) ? m.getReceiver() : m.getSender());
                Map<String, Object> chat = new LinkedHashMap<>();
                chat.put("other_id", otherId);
                chat.put("last_message", m.getContent());
                chat.put("last_at", m.getCreatedAt());
                chat.put("unread_count", unread);
                chatMap.put(otherId, chat);
            }
        }
        return ResponseEntity.ok(new ArrayList<>(chatMap.values()));
    }

    @GetMapping("/{userId}")
    @Transactional
    public ResponseEntity<List<Map<String, Object>>> getMessages(@AuthenticationPrincipal User me,
                                                                  @PathVariable UUID userId,
                                                                  @RequestParam(defaultValue = "1") int page) {
        User other = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        List<Message> messages = messageRepository.findConversation(me, other, PageRequest.of(page - 1, PAGE_SIZE));
        messageRepository.markAsRead(other, me);
        Collections.reverse(messages);
        return ResponseEntity.ok(messages.stream().map(this::toMap).toList());
    }

    @PostMapping("/{userId}")
    @Transactional
    public ResponseEntity<Map<String, Object>> sendMessage(@AuthenticationPrincipal User me,
                                                            @PathVariable UUID userId,
                                                            @RequestBody Map<String, String> body) {
        String content = body.get("content");
        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Content required");
        }
        User other = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Message message = new Message();
        message.setSender(me);
        message.setReceiver(other);
        message.setContent(content);
        messageRepository.save(message);
        return ResponseEntity.status(HttpStatus.CREATED).body(toMap(message));
    }

    private Map<String, Object> toMap(Message m) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", m.getId());
        map.put("sender_id", m.getSender().getId());
        map.put("receiver_id", m.getReceiver().getId());
        map.put("content", m.getContent());
        map.put("read", m.isRead());
        map.put("created_at", m.getCreatedAt());
        return map;
    }
}
