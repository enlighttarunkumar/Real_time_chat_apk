package com.chat_apk.chat_apk_backend.repository;

import com.chat_apk.chat_apk_backend.entity.Room;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RoomRepo extends MongoRepository<Room, String> {
    Room findByRoomId(String roomId);


}
