package com.chat_apk.chat_apk_backend.controller;

import com.chat_apk.chat_apk_backend.entity.Professor;
import com.chat_apk.chat_apk_backend.playload.RatingRequest;
import com.chat_apk.chat_apk_backend.service.ProfessorService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/professors")
public class ProfessorController {
    private final ProfessorService professorService;

    public ProfessorController(ProfessorService professorService) {
        this.professorService = professorService;
    }

    @PostMapping
    public ResponseEntity<Professor> saveProfessor(@RequestBody Professor professor) {
        return ResponseEntity.status(HttpStatus.CREATED).body(professorService.saveProfessor(professor));
    }

    @GetMapping("/search")
    public List<Professor> search(@RequestParam(value = "prefix", defaultValue = "") String prefix) {
        return professorService.search(prefix);
    }

    @GetMapping("/{id}")
    public Professor getProfessor(@PathVariable String id) {
        return professorService.getProfessor(id);
    }

    @PostMapping("/{id}/rating")
    public Professor addRating(@PathVariable String id, @RequestBody RatingRequest request) {
        return professorService.rateProfessor(id, request.getRating());
    }

}
