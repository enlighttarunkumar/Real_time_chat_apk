package com.chat_apk.chat_apk_backend.playload;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {
    private String roomId;
    private String professorId;
    private String professorName;
    private String subject;
    private String topic;
    private String professorPin;
}
