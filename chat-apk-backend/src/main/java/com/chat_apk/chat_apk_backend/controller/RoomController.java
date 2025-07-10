package com.chat_apk.chat_apk_backend.controller;

import com.chat_apk.chat_apk_backend.entity.Message;
import com.chat_apk.chat_apk_backend.entity.Room;
import com.chat_apk.chat_apk_backend.repository.RoomRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin("http://localhost:5173")
public class RoomController {

    @Autowired
    private RoomRepo roomRepo;
   //  create room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomid) {
        if(roomRepo.findByRoomId(roomid) != null) {
            return ResponseEntity.badRequest().body("Room already exists");
        }
        System.out.println(roomid);
        Room room = new Room();
        room.setRoomId(roomid);
        roomRepo.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }
     //get room
    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRooms(@PathVariable String roomId) {
        Room room = roomRepo.findByRoomId(roomId);
        if(room != null) {
            return ResponseEntity.ok(room);
        }
        return ResponseEntity.badRequest().body("Room not found");
    }
    //get message of room
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false)int page,
            @RequestParam(value = "size", defaultValue = "20", required = false)int size
            ) {
        Room room = roomRepo.findByRoomId(roomId);
        if(room == null) {
            return ResponseEntity.badRequest().build();
        }
        List<Message> messageList = room.getMessage();
        int start = Math.max(0,messageList.size() - (page+1) * size);
        int end = Math.min(messageList.size(), start + size);
        List<Message>modified = messageList.subList(start, end);

        return ResponseEntity.ok(modified);


    }

}
