package com.chat_apk.chat_apk_backend;

import com.chat_apk.chat_apk_backend.entity.Room;
import com.chat_apk.chat_apk_backend.service.ProfessorCredentialService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ProfessorCredentialServiceTests {
    private final ProfessorCredentialService credentialService = new ProfessorCredentialService();

    @Test
    void hashesAndVerifiesProfessorPin() {
        String pinHash = credentialService.hashPin("482901");

        assertNotEquals("482901", pinHash);
        assertTrue(credentialService.matchesPin("482901", pinHash));
        assertFalse(credentialService.matchesPin("482902", pinHash));
    }

    @Test
    void rotatingAccessTokenInvalidatesPreviousToken() {
        Room room = new Room();
        String firstToken = credentialService.rotateAccessToken(room);
        assertTrue(credentialService.hasProfessorAccess(room, firstToken));

        String secondToken = credentialService.rotateAccessToken(room);
        assertFalse(credentialService.hasProfessorAccess(room, firstToken));
        assertTrue(credentialService.hasProfessorAccess(room, secondToken));
    }
}
