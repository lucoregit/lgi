package com.lgi.model;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;


@Entity
@Table(name = "appointments")
public class Appointment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cli_id")
    private String client;

    @Column(name = "service")
    private String service;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "time")
    private String time;

    @Column(name = "duration")
    private Integer duration;

    @Column(name = "price")
    private String price;

    @Column(name = "localizacao")
    private String localizacao;

    @Column(name = "obs")
    private String obs;

    @Column(name = "status_id")
    private int status;

    @Column(name = "status_serv")
    private Integer statusServico;

    @Column(name = "pre_id")
    private String prestador;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cli_id", referencedColumnName = "documento_log", insertable = false, updatable = false)
    @JsonIgnoreProperties({"senha", "recoveryCode", "recoveryCodeExpiration", "hibernateLazyInitializer", "handler"})
    private Login clienteInfo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pre_id", referencedColumnName = "documento_log", insertable = false, updatable = false)
    @JsonIgnoreProperties({"senha", "recoveryCode", "recoveryCodeExpiration", "hibernateLazyInitializer", "handler"})
    private Login prestadorInfo;

    // --- GETTERS AND SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClient() {
        return client;
    }

    public void setClient(String client) {
        this.client = client;
    }

    public String getService() {
        return service;
    }

    public void setService(String service) {
        this.service = service;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public String getPrice() {
        return price;
    }

    public void setPrice(String price) {
        this.price = price;
    }

    public String getLocalizacao() { return localizacao; }

    public void setLocalizacao(String localizacao) { this.localizacao = localizacao; }

    public String getObs() { return obs; }

    public void setObs(String obs) { this.obs = obs; }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public Integer getStatusServico() { return statusServico; }

    public void setStatusServico(Integer statusServico) { this.statusServico = statusServico; }

    public String getPrestador() { return prestador; }

    public void setPrestador(String prestador) { this.prestador = prestador; }

    public Login getClienteInfo() { return clienteInfo; }

    public Login getPrestadorInfo() { return prestadorInfo; }
}