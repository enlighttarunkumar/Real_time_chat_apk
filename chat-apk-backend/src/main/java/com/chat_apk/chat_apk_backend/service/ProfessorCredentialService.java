package com.chat_apk.chat_apk_backend.service;

import com.chat_apk.chat_apk_backend.entity.Room;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class ProfessorCredentialService {
    private static final int PIN_ITERATIONS = 120_000;
    private static final int PIN_KEY_LENGTH = 256;
    private static final int SALT_LENGTH = 16;
    private static final int TOKEN_LENGTH = 32;

    private final SecureRandom secureRandom = new SecureRandom();

    public String hashPin(String pin) {
        byte[] salt = new byte[SALT_LENGTH];
        secureRandom.nextBytes(salt);
        byte[] hash = derivePin(pin, salt);
        return encode(salt) + ":" + encode(hash);
    }

    public boolean matchesPin(String pin, String storedHash) {
        if (pin == null || storedHash == null || !storedHash.contains(":")) {
            return false;
        }

        try {
            String[] parts = storedHash.split(":", 2);
            byte[] salt = Base64.getDecoder().decode(parts[0]);
            byte[] expected = Base64.getDecoder().decode(parts[1]);
            return MessageDigest.isEqual(expected, derivePin(pin, salt));
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public String rotateAccessToken(Room room) {
        byte[] tokenBytes = new byte[TOKEN_LENGTH];
        secureRandom.nextBytes(tokenBytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
        room.setProfessorAccessTokenHash(hashToken(token));
        return token;
    }

    public boolean hasProfessorAccess(Room room, String token) {
        if (room == null || token == null || token.isBlank()
                || room.getProfessorAccessTokenHash() == null) {
            return false;
        }

        byte[] expected = room.getProfessorAccessTokenHash().getBytes(StandardCharsets.UTF_8);
        byte[] actual = hashToken(token).getBytes(StandardCharsets.UTF_8);
        return MessageDigest.isEqual(expected, actual);
    }

    private byte[] derivePin(String pin, byte[] salt) {
        PBEKeySpec specification = new PBEKeySpec(pin.toCharArray(), salt, PIN_ITERATIONS, PIN_KEY_LENGTH);
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(specification).getEncoded();
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Unable to secure professor PIN", exception);
        } finally {
            specification.clearPassword();
        }
    }

    private String hashToken(String token) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return encode(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Unable to secure professor token", exception);
        }
    }

    private String encode(byte[] value) {
        return Base64.getEncoder().encodeToString(value);
    }
}
