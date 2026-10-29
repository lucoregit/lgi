package com.lgi.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_documento")
    private String userDocumento;

    @Column(name = "media_content", columnDefinition = "TEXT")
    private String mediaContent;

    @Column(name = "media_type")
    private String mediaType; // "image" or "video"

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "likes_count")
    private Integer likesCount = 0;

    @Transient
    private String userName;

    @Transient
    private boolean isLikedByUser;

    public Post() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUserDocumento() { return userDocumento; }
    public void setUserDocumento(String userDocumento) { this.userDocumento = userDocumento; }

    public String getMediaContent() { return mediaContent; }
    public void setMediaContent(String mediaContent) { this.mediaContent = mediaContent; }

    public String getMediaType() { return mediaType; }
    public void setMediaType(String mediaType) { this.mediaType = mediaType; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Integer getLikesCount() { return likesCount; }
    public void setLikesCount(Integer likesCount) { this.likesCount = likesCount; }

    public boolean isLikedByUser() { return isLikedByUser; }
    public void setLikedByUser(boolean likedByUser) { isLikedByUser = likedByUser; }
}
