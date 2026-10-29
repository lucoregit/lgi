package com.lgi.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "login")
public class Login {

    @Id
    @Column(name = "documento_log")
    private String documento;

    @Column(name = "nome_log")
    private String nome;

    @Column(name = "datanasc_log")
    private LocalDate dataNasc;

    @Column(name = "email_log")
    private String email;

    @Column(name = "senha_log")
    private String senha;

    @Column(name = "descr_log")
    private String descricao;

    @Column(name = "serviço_log")
    private String servico;

    @Column(name = "especialidade_log")
    private String especialidade;

    @Column(name = "formacao_log")
    private String formacao;

    @Column(name = "tempo_area_log")
    private String tempoArea;

    @Column(name = "valor_hora_log")
    private Double valorHora;

    @Column(name = "qualidade_log")
    private Double qualidade;

    @Column(name = "credibilidade_log")
    private String credibilidade;

    @Column(name = "email_comercial_log")
    private String emailComercial;

    @Column(name = "telefone_log")
    private String telefone;

    @Column(name = "loc_log")
    private String cidade;

    @Column(name = "recovery_code")
    private String recoveryCode;

    @Column(name = "recovery_code_expiration")
    private LocalDateTime recoveryCodeExpiration;

    public Login() {}

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDocumento() {
        return documento;
    }

    public void setDocumento(String documento) {
        this.documento = documento;
    }

    public LocalDate getDataNasc() {
        return dataNasc;
    }

    public void setDataNasc(LocalDate dataNasc) {
        this.dataNasc = dataNasc;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public String getServico() {
        return servico;
    }

    public void setServico(String servico) {
        this.servico = servico;
    }

    public String getEspecialidade() {
        return especialidade;
    }

    public void setEspecialidade(String especialidade) {
        this.especialidade = especialidade;
    }

    public String getFormacao() {
        return formacao;
    }

    public void setFormacao(String formacao) {
        this.formacao = formacao;
    }

    public String getTempoArea() {
        return tempoArea;
    }

    public void setTempoArea(String tempoArea) {
        this.tempoArea = tempoArea;
    }

    public Double getValorHora() {
        return valorHora;
    }

    public void setValorHora(Double valorHora) {
        this.valorHora = valorHora;
    }

    public Double getQualidade() {
        return qualidade;
    }

    public void setQualidade(Double qualidade) {
        this.qualidade = qualidade;
    }

    public String getCredibilidade() {
        return credibilidade;
    }

    public void setCredibilidade(String credibilidade) {
        this.credibilidade = credibilidade;
    }

    public String getEmailComercial() {
        return emailComercial;
    }

    public void setEmailComercial(String emailComercial) {
        this.emailComercial = emailComercial;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getCidade() {
        return cidade;
    }

    public void setCidade(String cidade) {
        this.cidade = cidade;
    }

    public String getRecoveryCode() {
        return recoveryCode;
    }

    public void setRecoveryCode(String recoveryCode) {
        this.recoveryCode = recoveryCode;
    }

    public LocalDateTime getRecoveryCodeExpiration() {
        return recoveryCodeExpiration;
    }

    public void setRecoveryCodeExpiration(LocalDateTime recoveryCodeExpiration) {
        this.recoveryCodeExpiration = recoveryCodeExpiration;
    }
}
