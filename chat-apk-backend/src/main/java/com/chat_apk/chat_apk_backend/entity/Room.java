package com.chat_apk.chat_apk_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "rooms")
public class Room {

    @Id
    private String id;

    private String roomId;
    private String professorId;
    private String professorName;
    private String subject;
    private String topic;
    private RoomStatus status = RoomStatus.OPEN;
    private List<Message> message = new ArrayList<>();

    @JsonIgnore
    private String professorPinHash;

    @JsonIgnore
    private String professorAccessTokenHash;
}
