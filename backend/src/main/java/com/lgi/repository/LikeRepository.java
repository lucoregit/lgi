package com.lgi.repository;

import com.lgi.model.Like;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByPostIdAndUserDocumento(Long postId, String userDocumento);
    long countByPostId(Long postId);
    boolean existsByPostIdAndUserDocumento(Long postId, String userDocumento);
    void deleteByPostId(Long postId);
}
