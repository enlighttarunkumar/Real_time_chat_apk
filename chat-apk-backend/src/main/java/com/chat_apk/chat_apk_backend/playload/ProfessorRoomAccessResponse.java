package com.chat_apk.chat_apk_backend.playload;

import com.chat_apk.chat_apk_backend.entity.Room;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProfessorRoomAccessResponse {
    private Room room;
    private String professorToken;
}
