package com.lgi.controller;

import com.lgi.model.Comment;
import com.lgi.model.Post;
import com.lgi.model.Like;
import com.lgi.repository.PostRepository;
import com.lgi.repository.CommentRepository;
import com.lgi.repository.LoginRepository;
import com.lgi.repository.LikeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    private final PostRepository postRepository;
    private final LoginRepository loginRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;

    public PostController(PostRepository postRepository, LoginRepository loginRepository, CommentRepository commentRepository, LikeRepository likeRepository) {
        this.postRepository = postRepository;
        this.loginRepository = loginRepository;
        this.commentRepository = commentRepository;
        this.likeRepository = likeRepository;
    }

    @GetMapping
    public List<Post> getAllPosts(@RequestParam(required = false) String currentUser) {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        posts.forEach(p -> populatePostData(p, currentUser));
        return posts;
    }

    @GetMapping("/user/{documento}")
    public List<Post> getUserPosts(@PathVariable String documento, @RequestParam(required = false) String currentUser) {
        List<Post> posts = postRepository.findByUserDocumentoOrderByCreatedAtDesc(documento);
        posts.forEach(p -> populatePostData(p, currentUser));
        return posts;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id, @RequestParam(required = false) String currentUser) {
        return postRepository.findById(id).map(p -> {
            populatePostData(p, currentUser);
            return ResponseEntity.ok(p);
        }).orElse(ResponseEntity.notFound().build());
    }

    private void populatePostData(Post post, String currentUser) {
        if (post.getUserDocumento() != null) {
            loginRepository.findById(post.getUserDocumento())
                    .ifPresent(u -> post.setUserName(u.getNome()));
        }
        if (currentUser != null) {
            post.setLikedByUser(likeRepository.existsByPostIdAndUserDocumento(post.getId(), currentUser));
        }
    }

    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody Map<String, String> body) {
        String documento = body.get("userDocumento");
        String content = body.get("mediaContent");
        String type = body.get("mediaType");
        String descricao = body.get("descricao");

        if (documento == null || content == null || type == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campos obrigatórios ausentes"));
        }

        Post post = new Post();
        post.setUserDocumento(documento);
        post.setMediaContent(content);
        post.setMediaType(type);
        post.setDescricao(descricao);

        Post saved = postRepository.save(post);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String userDoc = body.get("userDocumento");
        if (userDoc == null) return ResponseEntity.badRequest().body(Map.of("error", "userDocumento obrigatório"));

        return postRepository.findById(id).map(post -> {
            if (!likeRepository.existsByPostIdAndUserDocumento(id, userDoc)) {
                likeRepository.save(new Like(id, userDoc));
                post.setLikesCount((post.getLikesCount() == null ? 0 : post.getLikesCount()) + 1);
                postRepository.save(post);
            }
            return ResponseEntity.ok(Map.of("likes", post.getLikesCount(), "isLiked", true));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        List<Comment> comments = commentRepository.findByPostIdOrderByCreatedAtAsc(id);
        comments.forEach(c -> {
            if (c.getUserDocumento() != null) {
                loginRepository.findById(c.getUserDocumento())
                        .ifPresent(u -> c.setUserName(u.getNome()));
            }
        });
        return comments;
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String documento = body.get("userDocumento");
        String content = body.get("content");

        if (documento == null || content == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campos obrigatórios ausentes"));
        }

        Comment comment = new Comment();
        comment.setPostId(id);
        comment.setUserDocumento(documento);
        comment.setContent(content);

        Comment saved = commentRepository.save(comment);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/{id}/unlike")
    public ResponseEntity<?> unlikePost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String userDoc = body.get("userDocumento");
        if (userDoc == null) return ResponseEntity.badRequest().body(Map.of("error", "userDocumento obrigatório"));

        return postRepository.findById(id).map(post -> {
            likeRepository.findByPostIdAndUserDocumento(id, userDoc).ifPresent(like -> {
                likeRepository.delete(like);
                int current = post.getLikesCount() == null ? 0 : post.getLikesCount();
                post.setLikesCount(Math.max(0, current - 1));
                postRepository.save(post);
            });
            return ResponseEntity.ok(Map.of("likes", post.getLikesCount(), "isLiked", false));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> deletePost(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String userDoc = body.get("userDocumento");
        if (userDoc == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "userDocumento obrigatório"));
        }

        return postRepository.findUserDocumentoById(id).map(postUserDoc -> {
            if (!postUserDoc.equals(userDoc)) {
                return ResponseEntity.status(403).body(Map.of("error", "Você não tem permissão para deletar este post"));
            }

            commentRepository.deleteByPostId(id);
            likeRepository.deleteByPostId(id);
            postRepository.deleteById(id);

            return ResponseEntity.ok(Map.of("message", "Post deletado com sucesso"));
        }).orElse(ResponseEntity.notFound().build());
    }
}
