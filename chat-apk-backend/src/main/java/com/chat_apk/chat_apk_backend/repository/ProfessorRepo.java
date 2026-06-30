package com.chat_apk.chat_apk_backend.repository;

import com.chat_apk.chat_apk_backend.entity.Professor;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfessorRepo extends MongoRepository<Professor, String> {
    Professor findByRoomId(String roomId);
}
