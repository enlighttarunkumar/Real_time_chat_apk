package com.chat_apk.chat_apk_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    private String messageId;
    private String sender;
    private String content;
    private LocalDateTime timeStamp;
    private boolean pinned;

    Message(String sender, String content) {
        this.messageId = java.util.UUID.randomUUID().toString();
        this.sender = sender;
        this.content = content;
        this.timeStamp = LocalDateTime.now();
    }
}
