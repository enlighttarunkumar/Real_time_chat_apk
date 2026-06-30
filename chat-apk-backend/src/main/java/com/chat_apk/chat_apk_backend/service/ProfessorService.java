package com.chat_apk.chat_apk_backend.service;

import com.chat_apk.chat_apk_backend.datastructure.ProfessorTrie;
import com.chat_apk.chat_apk_backend.entity.Professor;
import com.chat_apk.chat_apk_backend.entity.Room;
import com.chat_apk.chat_apk_backend.entity.RoomStatus;
import com.chat_apk.chat_apk_backend.repository.ProfessorRepo;
import com.chat_apk.chat_apk_backend.repository.RoomRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ProfessorService {
    private final ProfessorRepo professorRepo;
    private final ProfessorTrie professorTrie;
    private final RoomRepo roomRepo;
    private volatile boolean trieInitialized;

    public ProfessorService(ProfessorRepo professorRepo, ProfessorTrie professorTrie, RoomRepo roomRepo) {
        this.professorRepo = professorRepo;
        this.professorTrie = professorTrie;
        this.roomRepo = roomRepo;
    }

    public Professor saveProfessor(Professor professor) {
        validateProfessor(professor);

        Professor existing = professorRepo.findByRoomId(professor.getRoomId().trim());
        if (existing != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "A professor profile already exists for this room");
        }

        professor.setName(professor.getName().trim());
        professor.setSubject(professor.getSubject().trim());
        professor.setDepartment(professor.getDepartment().trim());
        professor.setTopic(professor.getTopic().trim());
        professor.setRoomId(professor.getRoomId().trim());
        Professor saved = professorRepo.save(professor);
        refreshTrie();
        return saved;
    }

    public List<Professor> search(String prefix) {
        ensureTrieInitialized();
        return professorTrie.searchByPrefix(prefix, 50).stream()
                .filter(this::attachActiveRoomTopic)
                .limit(8)
                .toList();
    }

    public Professor getProfessor(String id) {
        return professorRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Professor not found"));
    }

    public Professor rateProfessor(String id, int rating) {
        if (rating < 1 || rating > 5) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
        }

        Professor professor = getProfessor(id);
        double total = professor.getAverageRating() * professor.getRatingCount();
        int newCount = professor.getRatingCount() + 1;
        professor.setRatingCount(newCount);
        professor.setAverageRating(Math.round(((total + rating) / newCount) * 10.0) / 10.0);
        Professor saved = professorRepo.save(professor);
        refreshTrie();
        return saved;
    }

    public Professor updateStatus(String id, boolean online) {
        Professor professor = getProfessor(id);
        professor.setOnline(online);
        Professor saved = professorRepo.save(professor);
        refreshTrie();
        return saved;
    }

    public void markOnlineIfPresent(String id) {
        if (isBlank(id)) {
            return;
        }

        professorRepo.findById(id).ifPresent(professor -> {
            professor.setOnline(true);
            professorRepo.save(professor);
            refreshTrie();
        });
    }

    private void refreshTrie() {
        professorTrie.rebuild(professorRepo.findAll());
        trieInitialized = true;
    }

    private void ensureTrieInitialized() {
        if (!trieInitialized) {
            synchronized (this) {
                if (!trieInitialized) {
                    refreshTrie();
                }
            }
        }
    }

    private void validateProfessor(Professor professor) {
        if (professor == null
                || isBlank(professor.getName())
                || isBlank(professor.getSubject())
                || isBlank(professor.getDepartment())
                || isBlank(professor.getTopic())
                || isBlank(professor.getRoomId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Name, subject, department, topic and room ID are required");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private boolean attachActiveRoomTopic(Professor professor) {
        Room room = roomRepo.findByRoomId(professor.getRoomId());
        if (room == null || room.getStatus() == RoomStatus.RESOLVED) {
            return false;
        }
        professor.setTopic(room.getTopic());
        return true;
    }
}
