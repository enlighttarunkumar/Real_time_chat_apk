package com.chat_apk.chat_apk_backend.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "professors")
public class Professor {

    @Id
    private String id;

    private String name;
    private String subject;
    private String department;
    private String topic;
    private String roomId;
    private boolean online;
    private double averageRating;
    private int ratingCount;
}
