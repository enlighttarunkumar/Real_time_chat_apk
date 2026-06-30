package com.chat_apk.chat_apk_backend.datastructure;

import com.chat_apk.chat_apk_backend.entity.Professor;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TrieNode {
    private final Map<Character, TrieNode> children = new HashMap<>();
    private final List<Professor> professors = new ArrayList<>();

    public Map<Character, TrieNode> getChildren() {
        return children;
    }

    public List<Professor> getProfessors() {
        return professors;
    }
}
