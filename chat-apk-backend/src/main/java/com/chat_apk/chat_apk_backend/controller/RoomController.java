package com.chat_apk.chat_apk_backend.controller;

import com.chat_apk.chat_apk_backend.config.AppConstant;
import com.chat_apk.chat_apk_backend.entity.Message;
import com.chat_apk.chat_apk_backend.entity.Room;
import com.chat_apk.chat_apk_backend.entity.RoomStatus;
import com.chat_apk.chat_apk_backend.playload.CreateRoomRequest;
import com.chat_apk.chat_apk_backend.playload.ProfessorRejoinRequest;
import com.chat_apk.chat_apk_backend.playload.ProfessorRoomAccessResponse;
import com.chat_apk.chat_apk_backend.repository.RoomRepo;
import com.chat_apk.chat_apk_backend.service.ProfessorCredentialService;
import com.chat_apk.chat_apk_backend.service.ProfessorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/rooms")
@CrossOrigin(origins = {AppConstant.URL, AppConstant.LOCAL_URL, AppConstant.LOCAL_IP_URL})
public class RoomController {

    private final RoomRepo roomRepo;
    private final ProfessorService professorService;
    private final ProfessorCredentialService credentialService;

    public RoomController(
            RoomRepo roomRepo,
            ProfessorService professorService,
            ProfessorCredentialService credentialService
    ) {
        this.roomRepo = roomRepo;
        this.professorService = professorService;
        this.credentialService = credentialService;
    }

    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody CreateRoomRequest request) {
        if (request == null || isBlank(request.getRoomId()) || isBlank(request.getProfessorName())
                || isBlank(request.getSubject()) || isBlank(request.getTopic())) {
            return ResponseEntity.badRequest().body("Room ID, professor, subject and topic are required");
        }
        if (!isValidPin(request.getProfessorPin())) {
            return ResponseEntity.badRequest().body("Professor PIN must contain exactly 6 digits");
        }

        String roomId = request.getRoomId().trim();
        if (roomRepo.findByRoomId(roomId) != null) {
            return ResponseEntity.badRequest().body("Room already exists");
        }

        Room room = new Room();
        room.setRoomId(roomId);
        room.setProfessorId(request.getProfessorId());
        room.setProfessorName(request.getProfessorName().trim());
        room.setSubject(request.getSubject().trim());
        room.setTopic(request.getTopic().trim());
        room.setStatus(RoomStatus.OPEN);
        room.setProfessorPinHash(credentialService.hashPin(request.getProfessorPin()));
        String professorToken = credentialService.rotateAccessToken(room);
        Room savedRoom = roomRepo.save(room);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ProfessorRoomAccessResponse(savedRoom, professorToken));
    }

    @GetMapping("/{roomId}")
    public ResponseEntity<?> getRoom(@PathVariable String roomId) {
        Room room = roomRepo.findByRoomId(roomId);
        if (room != null) {
            if (room.getStatus() == null) {
                room.setStatus(RoomStatus.OPEN);
            }
            return ResponseEntity.ok(room);
        }
        return ResponseEntity.badRequest().body("Room not found");
    }

    @PostMapping("/{roomId}/professor/rejoin")
    public ResponseEntity<?> rejoinAsProfessor(
            @PathVariable String roomId,
            @RequestBody ProfessorRejoinRequest request
    ) {
        if (request == null || !isValidPin(request.getProfessorPin())) {
            return ResponseEntity.badRequest().body("A valid 6-digit professor PIN is required");
        }

        Room room = roomRepo.findByRoomId(roomId.trim());
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found");
        }

        if (!credentialService.matchesPin(request.getProfessorPin(), room.getProfessorPinHash())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Incorrect professor PIN");
        }

        if (room.getStatus() == null) {
            room.setStatus(RoomStatus.OPEN);
        }
        String professorToken = credentialService.rotateAccessToken(room);
        Room savedRoom = roomRepo.save(room);
        professorService.markOnlineIfPresent(room.getProfessorId());
        return ResponseEntity.ok(new ProfessorRoomAccessResponse(savedRoom, professorToken));
    }

    @GetMapping("/{roomId}/messages")
    public ResponseEntity<?> getRoomMessages(
            @PathVariable String roomId,
            @RequestParam(value = "page", defaultValue = "0", required = false) int page,
            @RequestParam(value = "size", defaultValue = "20", required = false) int size
    ) {
        Room room = roomRepo.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().build();
        }

        List<Message> messageList = room.getMessage();
        int start = Math.max(0, messageList.size() - (page + 1) * size);
        int end = Math.min(messageList.size(), start + size);
        return ResponseEntity.ok(messageList.subList(start, end));
    }

    @PatchMapping("/{roomId}/resolve")
    public ResponseEntity<?> resolveRoom(
            @PathVariable String roomId,
            @RequestHeader(value = "X-Professor-Token", required = false) String professorToken
    ) {
        Room room = roomRepo.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found");
        }
        if (!credentialService.hasProfessorAccess(room, professorToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Professor access required");
        }

        boolean hasFinalAnswer = room.getMessage().stream().anyMatch(Message::isPinned);
        if (!hasFinalAnswer) {
            return ResponseEntity.badRequest().body("Pin a final answer before resolving the doubt");
        }

        room.setStatus(RoomStatus.RESOLVED);
        return ResponseEntity.ok(roomRepo.save(room));
    }

    @PatchMapping("/{roomId}/messages/{messageId}/pin")
    public ResponseEntity<?> pinMessage(
            @PathVariable String roomId,
            @PathVariable String messageId,
            @RequestHeader(value = "X-Professor-Token", required = false) String professorToken
    ) {
        Room room = roomRepo.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found");
        }
        if (!credentialService.hasProfessorAccess(room, professorToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Professor access required");
        }

        Message selected = room.getMessage().stream()
                .filter(message -> Objects.equals(messageId, message.getMessageId()))
                .findFirst()
                .orElse(null);

        if (selected == null) {
            return ResponseEntity.badRequest().body("Message not found");
        }

        room.getMessage().forEach(message -> message.setPinned(false));
        selected.setPinned(true);
        roomRepo.save(room);
        return ResponseEntity.ok(selected);
    }

    @PatchMapping("/{roomId}/professor/status")
    public ResponseEntity<?> updateProfessorStatus(
            @PathVariable String roomId,
            @RequestParam boolean online,
            @RequestHeader(value = "X-Professor-Token", required = false) String professorToken
    ) {
        Room room = roomRepo.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room not found");
        }
        if (!credentialService.hasProfessorAccess(room, professorToken)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Professor access required");
        }
        if (isBlank(room.getProfessorId())) {
            return ResponseEntity.badRequest().body("Professor profile not found");
        }

        return ResponseEntity.ok(professorService.updateStatus(room.getProfessorId(), online));
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean isValidPin(String value) {
        return value != null && value.matches("\\d{6}");
    }
}
