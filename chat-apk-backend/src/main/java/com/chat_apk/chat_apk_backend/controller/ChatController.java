package com.chat_apk.chat_apk_backend.controller;

import com.chat_apk.chat_apk_backend.config.AppConstant;
import com.chat_apk.chat_apk_backend.entity.Room;
import com.chat_apk.chat_apk_backend.entity.Message;
import com.chat_apk.chat_apk_backend.entity.RoomStatus;

import com.chat_apk.chat_apk_backend.playload.MessageRequest;
import com.chat_apk.chat_apk_backend.repository.RoomRepo;
import com.chat_apk.chat_apk_backend.service.ProfessorCredentialService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.util.UUID;

@Controller
@CrossOrigin(origins = {AppConstant.URL, AppConstant.LOCAL_URL, AppConstant.LOCAL_IP_URL})
public class ChatController {

    private final RoomRepo roomRepository;
    private final ProfessorCredentialService credentialService;

    public ChatController(RoomRepo roomRepository, ProfessorCredentialService credentialService) {
        this.roomRepository = roomRepository;
        this.credentialService = credentialService;
    }

    //for sending and receiving messages
    @MessageMapping("/sendMessage/{roomId}")// /app/sendMessage/roomId
    @SendTo("/topic/room/{roomId}")//subscribe
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ) {

        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            throw new IllegalArgumentException("Room not found");
        }
        if (request.getSender() == null || request.getSender().isBlank()
                || request.getContent() == null || request.getContent().isBlank()) {
            throw new IllegalArgumentException("Sender and message content are required");
        }
        if (room.getProfessorName() != null
                && room.getProfessorName().equalsIgnoreCase(request.getSender().trim())
                && !credentialService.hasProfessorAccess(room, request.getProfessorToken())) {
            throw new SecurityException("Professor access required");
        }

        Message message = new Message();
        message.setMessageId(UUID.randomUUID().toString());
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());
        message.setPinned(false);
        if (room.getStatus() == RoomStatus.RESOLVED) {
            throw new IllegalStateException("This doubt is already resolved");
        }
        room.getMessage().add(message);
        roomRepository.save(room);

        return message;


    }
}
