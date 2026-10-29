package com.lgi.controller;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.lgi.model.Login;
import com.lgi.repository.LoginRepository;
import com.lgi.service.EmailService;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.dao.DataAccessException;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final LoginRepository loginRepository;
    private final JdbcTemplate jdbcTemplate;
    private final EmailService emailService;

    public AuthController(LoginRepository loginRepository, JdbcTemplate jdbcTemplate, EmailService emailService) {
        this.loginRepository = loginRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.emailService = emailService;
    }

    @GetMapping("/user/{documento}")
    public ResponseEntity<?> getUser(@PathVariable String documento){
        var opt = loginRepository.findById(documento);
        if(opt.isEmpty()){
            return ResponseEntity.notFound().build();
        }
        Login l = opt.get();
        java.util.Map<String,Object> resp = new java.util.HashMap<>();
        resp.put("documento", l.getDocumento());
        resp.put("nome", l.getNome());
        resp.put("email", l.getEmail());
        resp.put("servico", l.getServico());
        resp.put("especialidade", l.getEspecialidade());
        resp.put("dataNasc", l.getDataNasc());
        resp.put("formacao", l.getFormacao());
        resp.put("tempoArea", l.getTempoArea());
        resp.put("valorHora", l.getValorHora());
        resp.put("qualidade", l.getQualidade());
        resp.put("credibilidade", l.getCredibilidade());
        resp.put("emailComercial", l.getEmailComercial());
        resp.put("telefone", l.getTelefone());
        resp.put("cidade", l.getCidade());
        if(l.getDescricao() != null){
            resp.put("descricao", l.getDescricao());
        }
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/providers")
    public ResponseEntity<?> listProviders(){
        // prefer using JdbcTemplate to gracefully handle missing optional columns
        try{
            try{
                var rows = jdbcTemplate.queryForList("SELECT documento_log AS documento, nome_log AS nome, descr_log AS descricao, servi\u00E7o_log AS servico, qualidade_log AS qualidade, credibilidade_log AS credibilidade FROM login");
                return ResponseEntity.ok(rows);
            }catch(DataAccessException ex){
                // fallback if optional columns don't exist
                var rows = jdbcTemplate.queryForList("SELECT documento_log AS documento, nome_log AS nome, descr_log AS descricao FROM login");
                var list = new java.util.ArrayList<java.util.Map<String,Object>>();
                for(var r : rows){
                    java.util.Map<String,Object> m = new java.util.HashMap<>();
                    m.putAll(r);
                    m.put("servico", "");
                    m.put("qualidade", null);
                    m.put("credibilidade", null);
                    list.add(m);
                }
                return ResponseEntity.ok(list);
            }
        }catch(Exception e){
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body){
        String cred = body.getOrDefault("credenciais", "").trim();
        String senha = body.getOrDefault("senha", "");

        if(cred.isEmpty() || senha.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("error", "Credenciais e senha são obrigatórias"));
        }

        // busca por documento (PK) ou por email
        java.util.Optional<com.lgi.model.Login> opt = loginRepository.findById(cred);
        if(opt.isEmpty()){
            opt = loginRepository.findByEmail(cred);
        }

        if(opt.isEmpty()){
            return ResponseEntity.status(401).body(Map.of("error", "Credenciais ou Senha estão incorretas"));
        }

        com.lgi.model.Login saved = opt.get();
        // comparação simples de senha (atenção: em produção use hashing)
        if(!senha.equals(saved.getSenha())){
            return ResponseEntity.status(401).body(Map.of("error", "Credenciais ou Senha estão incorretas"));
        }

        return ResponseEntity.ok(Map.of("message", "Autenticado", "documento", saved.getDocumento()));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body){
        // Validação básica
        String documento = body.getOrDefault("documento", "").trim();
        String nome = body.getOrDefault("nome", "").trim();
        String data = body.getOrDefault("dataNasc", "").trim();
        String email = body.getOrDefault("email", "").trim();
        String senha = body.getOrDefault("senha", "");

        if(documento.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'documento' é obrigatório"));
        }
        if(nome.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'nome' é obrigatório"));
        }
        if(data.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'dataNasc' é obrigatório"));
        }
        if(email.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'email' é obrigatório"));
        }
        if(senha.isEmpty()){
            return ResponseEntity.badRequest().body(Map.of("error", "Campo 'senha' é obrigatório"));
        }

        try {
            Login l = new Login();
            l.setDocumento(documento);
            l.setNome(nome);
            try{
                LocalDate parsed = LocalDate.parse(data);
                // validate age between 18 and 100
                long years = java.time.Period.between(parsed, LocalDate.now()).getYears();
                if (years < 18 || years > 100) {
                    return ResponseEntity.badRequest().body(Map.of("error", "Idade deve ser entre 18 e 100 anos"));
                }
                l.setDataNasc(parsed);
            }catch(Exception ex){
                return ResponseEntity.badRequest().body(Map.of("error", "Formato de data inválido. Use YYYY-MM-DD"));
            }
            l.setEmail(email);
            l.setSenha(senha);

            // Verifica se já existe (documento é PK)
            if(loginRepository.existsById(documento)){
                return ResponseEntity.status(409).body(Map.of("error", "Documento já cadastrado"));
            }

            Login saved = loginRepository.save(l);
            return ResponseEntity.ok(Map.of("message", "Cadastro salvo", "documento", saved.getDocumento()));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/user/{documento}")
    public ResponseEntity<?> updateUser(@PathVariable String documento, @RequestBody Map<String,String> body){
        var opt = loginRepository.findById(documento);
        if(opt.isEmpty()) return ResponseEntity.notFound().build();
        Login l = opt.get();
        String nome = body.get("nome");
        String descricao = body.get("descricao");
        String servico = body.get("servico");
        String especialidade = body.get("especialidade");
        String formacao = body.get("formacao");
        String tempoArea = body.get("tempoArea");
        String valorHoraStr = body.get("valorHora");
        String emailComercial = body.get("emailComercial");
        String cidade = body.get("cidade");
        if(cidade == null) cidade = body.get("localizacao");

        if(nome != null) l.setNome(nome);
        if(descricao != null) l.setDescricao(descricao);
        if(servico != null) l.setServico(servico);
        if(especialidade != null) l.setEspecialidade(especialidade);
        if(formacao != null) l.setFormacao(formacao);
        if(tempoArea != null) l.setTempoArea(tempoArea);
        if(emailComercial != null) l.setEmailComercial(emailComercial);
        if(cidade != null) l.setCidade(cidade);
        if(valorHoraStr != null) {
            try {
                l.setValorHora(Double.parseDouble(valorHoraStr));
            } catch (Exception e) {}
        }

        Login saved = loginRepository.save(l);
        java.util.Map<String,Object> resp = new java.util.HashMap<>();
        resp.put("documento", saved.getDocumento());
        resp.put("nome", saved.getNome());
        resp.put("email", saved.getEmail());
        resp.put("servico", saved.getServico());
        resp.put("especialidade", saved.getEspecialidade());
        resp.put("dataNasc", saved.getDataNasc());
        resp.put("formacao", saved.getFormacao());
        resp.put("tempoArea", saved.getTempoArea());
        resp.put("valorHora", saved.getValorHora());
        resp.put("qualidade", saved.getQualidade());
        resp.put("credibilidade", saved.getCredibilidade());
        resp.put("emailComercial", saved.getEmailComercial());
        resp.put("telefone", saved.getTelefone());
        resp.put("cidade", saved.getCidade());
        if(saved.getDescricao()!=null) resp.put("descricao", saved.getDescricao());
        return ResponseEntity.ok(resp);
    }

    @PutMapping("/user/{documento}/location")
    public ResponseEntity<?> updateUserLocation(@PathVariable String documento, @RequestBody Map<String,String> body){
        var opt = loginRepository.findById(documento);
        if(opt.isEmpty()) return ResponseEntity.notFound().build();

        String cidade = body.get("cidade");
        if(cidade == null) cidade = body.get("localizacao");
        if(cidade == null) return ResponseEntity.badRequest().body(Map.of("error", "Campo 'cidade' é obrigatório"));

        Login l = opt.get();
        l.setCidade(cidade);
        Login saved = loginRepository.save(l);

        java.util.Map<String,Object> resp = new java.util.HashMap<>();
        resp.put("documento", saved.getDocumento());
        resp.put("cidade", saved.getCidade());
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/verify-password")
    public ResponseEntity<?> verifyPassword(@RequestBody Map<String, String> body){
        String cred = body.getOrDefault("credenciais", "").trim();
        String senha = body.getOrDefault("senha", "");

        java.util.Optional<com.lgi.model.Login> opt = loginRepository.findById(cred);
        if(opt.isEmpty()){
            opt = loginRepository.findByEmail(cred);
        }

        if(opt.isEmpty() || !senha.equals(opt.get().getSenha())){
            return ResponseEntity.status(401).body(Map.of("valid", false));
        }

        return ResponseEntity.ok(Map.of("valid", true));
    }

    @PutMapping("/update-password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> body){
        String cred = body.getOrDefault("credenciais", "").trim();
        String novaSenha = body.getOrDefault("novaSenha", "");

        java.util.Optional<com.lgi.model.Login> opt = loginRepository.findById(cred);
        if(opt.isEmpty()){
            opt = loginRepository.findByEmail(cred);
        }

        if(opt.isEmpty()){
            return ResponseEntity.status(404).body(Map.of("error", "Usuário não encontrado"));
        }

        Login l = opt.get();
        l.setSenha(novaSenha);
        loginRepository.save(l);

        return ResponseEntity.ok(Map.of("message", "Senha atualizada com sucesso"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String cred = body.getOrDefault("credenciais", "").trim();
        if (cred.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email ou documento é obrigatório"));
        }

        var opt = loginRepository.findById(cred);
        if (opt.isEmpty()) {
            opt = loginRepository.findByEmail(cred);
        }

        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuário não encontrado"));
        }

        Login user = opt.get();
        String code = String.format("%06d", new Random().nextInt(1000000));
        user.setRecoveryCode(code);
        user.setRecoveryCodeExpiration(LocalDateTime.now().plusMinutes(10));
        loginRepository.save(user);

        emailService.sendRecoveryCode(user.getEmail(), code);

        return ResponseEntity.ok(Map.of("message", "Código de recuperação enviado para o email " + user.getEmail()));
    }

    // ADMIN: fix ages for existing users — set to 18 years old when outside allowed range
    @PostMapping("/admin/fix-ages")
    public ResponseEntity<?> fixAges() {
        try {
            var all = loginRepository.findAll();
            LocalDate now = LocalDate.now();
            LocalDate default18 = now.minusYears(18);
            int updated = 0;
            for (Login l : all) {
                LocalDate dn = l.getDataNasc();
                boolean change = false;
                if (dn == null) {
                    change = true;
                } else {
                    long years = java.time.Period.between(dn, now).getYears();
                    if (years < 18 || years > 100) change = true;
                }
                if (change) {
                    l.setDataNasc(default18);
                    loginRepository.save(l);
                    updated++;
                }
            }
            return ResponseEntity.ok(Map.of("updated", updated));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-recovery-code")
    public ResponseEntity<?> verifyRecoveryCode(@RequestBody Map<String, String> body) {
        String cred = body.getOrDefault("credenciais", "").trim();
        String code = body.getOrDefault("code", "").trim();

        var opt = loginRepository.findById(cred);
        if (opt.isEmpty()) {
            opt = loginRepository.findByEmail(cred);
        }

        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuário não encontrado"));
        }

        Login user = opt.get();
        if (user.getRecoveryCode() == null || !user.getRecoveryCode().equals(code)) {
            return ResponseEntity.status(401).body(Map.of("error", "Código inválido"));
        }

        if (user.getRecoveryCodeExpiration() == null || user.getRecoveryCodeExpiration().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("error", "Código expirado"));
        }

        return ResponseEntity.ok(Map.of("message", "Código verificado com sucesso"));
    }

    @PostMapping("/reset-password-recovery")
    public ResponseEntity<?> resetPasswordRecovery(@RequestBody Map<String, String> body) {
        String cred = body.getOrDefault("credenciais", "").trim();
        String code = body.getOrDefault("code", "").trim();
        String novaSenha = body.getOrDefault("novaSenha", "");

        var opt = loginRepository.findById(cred);
        if (opt.isEmpty()) {
            opt = loginRepository.findByEmail(cred);
        }

        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuário não encontrado"));
        }

        Login user = opt.get();
        if (user.getRecoveryCode() == null || !user.getRecoveryCode().equals(code)) {
            return ResponseEntity.status(401).body(Map.of("error", "Código inválido"));
        }

        if (user.getRecoveryCodeExpiration() == null || user.getRecoveryCodeExpiration().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(401).body(Map.of("error", "Código expirado"));
        }

        user.setSenha(novaSenha);
        user.setRecoveryCode(null);
        user.setRecoveryCodeExpiration(null);
        loginRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Senha resetada com sucesso"));
    }

    @GetMapping("/services")
    public ResponseEntity<?> listAllServices() {
        try {
            var rows = jdbcTemplate.queryForList("SELECT classe_serv AS name, cod_serv AS code FROM servico ORDER BY classe_serv ASC");
            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/specialties/{serviceCode}")
    public ResponseEntity<?> listSpecialties(@PathVariable String serviceCode) {
        try {
            var rows = jdbcTemplate.queryForList("SELECT cod_serv1 AS code, descr_serv1 AS name FROM servico1 WHERE cod2_serv1 = ? ORDER BY descr_serv1 ASC", serviceCode);
            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
