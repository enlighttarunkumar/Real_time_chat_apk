package com.chat_apk.chat_apk_backend.controller;

import com.chat_apk.chat_apk_backend.config.AppConstant;
import com.chat_apk.chat_apk_backend.entity.Room;
import com.chat_apk.chat_apk_backend.entity.Message;

import com.chat_apk.chat_apk_backend.playload.MessageRequest;
import com.chat_apk.chat_apk_backend.repository.RoomRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;

@Controller
@CrossOrigin(AppConstant.URL)
public class ChatController {

    @Autowired
    private RoomRepo roomRepository;

    //for sending and receiving messages
    @MessageMapping("/sendMessage/{roomId}")// /app/sendMessage/roomId
    @SendTo("/topic/room/{roomId}")//subscribe
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ) {

        Room room = roomRepository.findByRoomId(request.getRoomId());
        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());
        if (room != null) {
            room.getMessage().add(message);
            roomRepository.save(room);
        } else {
            throw new RuntimeException("room not found !!");
        }

        return message;


    }
}