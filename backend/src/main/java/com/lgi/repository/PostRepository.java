package com.lgi.repository;

import com.lgi.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findByUserDocumentoOrderByCreatedAtDesc(String userDocumento);

    @Query("SELECT p.userDocumento FROM Post p WHERE p.id = :id")
    Optional<String> findUserDocumentoById(@Param("id") Long id);
}

