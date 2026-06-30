package com.chat_apk.chat_apk_backend.datastructure;

import com.chat_apk.chat_apk_backend.entity.Professor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Component
public class ProfessorTrie {
    private TrieNode root = new TrieNode();

    public synchronized void rebuild(List<Professor> professors) {
        root = new TrieNode();
        professors.forEach(this::insert);
    }

    public synchronized void insert(Professor professor) {
        if (professor == null || professor.getName() == null || professor.getName().isBlank()) {
            return;
        }

        TrieNode current = root;
        String name = normalize(professor.getName());
        for (char character : name.toCharArray()) {
            current = current.getChildren().computeIfAbsent(character, key -> new TrieNode());
        }

        current.getProfessors().removeIf(existing ->
                existing.getId() != null && existing.getId().equals(professor.getId()));
        current.getProfessors().add(professor);
    }

    public synchronized List<Professor> searchByPrefix(String prefix, int limit) {
        TrieNode current = root;
        for (char character : normalize(prefix).toCharArray()) {
            current = current.getChildren().get(character);
            if (current == null) {
                return List.of();
            }
        }

        List<Professor> matches = new ArrayList<>();
        collect(current, matches);
        return matches.stream()
                .sorted(Comparator.comparing(Professor::isOnline).reversed()
                        .thenComparing(Comparator.comparingDouble(Professor::getAverageRating).reversed())
                        .thenComparing(Professor::getName, String.CASE_INSENSITIVE_ORDER))
                .limit(limit)
                .toList();
    }

    private void collect(TrieNode node, List<Professor> matches) {
        matches.addAll(node.getProfessors());
        node.getChildren().values().forEach(child -> collect(child, matches));
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
