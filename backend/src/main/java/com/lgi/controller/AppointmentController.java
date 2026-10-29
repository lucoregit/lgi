package com.lgi.controller;

import com.lgi.model.Appointment;
import com.lgi.repository.AppointmentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.time.Period;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.lgi.model.Login;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = "http://localhost:3000")
public class AppointmentController {

    private final AppointmentRepository appointmentRepository;
    private final JdbcTemplate jdbcTemplate;

    public AppointmentController(AppointmentRepository appointmentRepository, JdbcTemplate jdbcTemplate) {
        this.appointmentRepository = appointmentRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping
    public List<Appointment> getAppointmentsByMonth(
            @RequestParam int year,
            @RequestParam int month,
            @RequestParam String prestadorId) {
        return appointmentRepository.findByYearMonthAndPrestador(year, month, prestadorId);
    }

    @PostMapping
    public ResponseEntity<?> createAppointment(@RequestBody Appointment novoAppointment) {
        try {
            novoAppointment.setStatus(1);
            novoAppointment.setStatusServico(1);
            Appointment salvo = appointmentRepository.save(novoAppointment);
            return ResponseEntity.ok(salvo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Erro ao criar agendamento: " + e.getMessage()));
        }
    }

    @GetMapping("/controle/{prestadorId}")
    public ResponseEntity<?> getControleServico(@PathVariable String prestadorId) {
        try {
            LocalDate today = LocalDate.now();
            List<Appointment> all = appointmentRepository.findByPrestador(prestadorId);

            List<Map<String, Object>> possiveis = new ArrayList<>();
            List<Map<String, Object>> hoje = new ArrayList<>();
            List<Map<String, Object>> agendados = new ArrayList<>();
            List<Map<String, Object>> recusados = new ArrayList<>();

            for (Appointment a : all) {
                Integer st = a.getStatusServico();
                if (st == null) continue;

                Map<String, Object> item = new HashMap<>();
                item.put("id", a.getId());

                Login clientInfo = a.getClienteInfo();
                String clientName = (clientInfo != null) ? clientInfo.getNome() : null;
                item.put("client", (clientName != null) ? clientName : a.getClient());
                item.put("clientDoc", a.getClient());

                if (clientInfo != null) {
                    item.put("clientAge", (clientInfo.getDataNasc() != null)
                        ? Period.between(clientInfo.getDataNasc(), LocalDate.now()).getYears() : null);
                    item.put("clientCity", clientInfo.getCidade());
                    item.put("clientCred", clientInfo.getCredibilidade());
                } else {
                    item.put("clientAge", null);
                    item.put("clientCity", null);
                    item.put("clientCred", null);
                }

                String serviceName = getServiceName(a.getService());
                item.put("service", (serviceName != null) ? serviceName : a.getService());
                item.put("serviceCode", a.getService());

                item.put("date", (a.getDate() != null) ? a.getDate().toString() : null);
                item.put("time", a.getTime());
                item.put("price", a.getPrice());

                if (st == 1) {
                    possiveis.add(item);
                } else if (st == 2) {
                    if (a.getDate() != null && a.getDate().equals(today)) {
                        hoje.add(item);
                    } else {
                        agendados.add(item);
                    }
                } else if (st == 3) {
                    recusados.add(item);
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("possiveis", possiveis);
            result.put("hoje", hoje);
            result.put("agendados", agendados);
            result.put("recusados", recusados);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}/status-servico")
    public ResponseEntity<?> updateStatusServico(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> body) {
        Integer novoStatus = body.get("statusServico");
        if (novoStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "statusServico é obrigatório"));
        }
        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatusServico(novoStatus);
            appointmentRepository.save(appointment);
            return ResponseEntity.ok(Map.of("message", "Status atualizado"));
        }).orElse(ResponseEntity.notFound().build());
    }

    private String getServiceName(String serviceCode) {
        if (serviceCode == null || serviceCode.isEmpty()) return null;
        try {
            var rows = jdbcTemplate.queryForList(
                "SELECT descr_serv1 AS name FROM servico1 WHERE cod_serv1 = ?", serviceCode);
            if (!rows.isEmpty()) {
                return (String) rows.get(0).get("name");
            }
        } catch (Exception ignored) {}
        return null;
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String novoStatus = body.get("status");

        if (novoStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Status é obrigatório"));
        }

        return appointmentRepository.findById(id).map(appointment -> {
            appointment.setStatus(Integer.parseInt(novoStatus));
            appointmentRepository.save(appointment);
            return ResponseEntity.ok(appointment);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/minhas-solicitacoes/{clienteId}")
    public ResponseEntity<?> getMinhasSolicitacoes(@PathVariable String clienteId) {
        try {
            List<Appointment> all = appointmentRepository.findByClient(clienteId);
            List<Map<String, Object>> result = new ArrayList<>();
            for (Appointment a : all) {
                Map<String, Object> item = new HashMap<>();
                item.put("id", a.getId());
                item.put("statusServico", a.getStatusServico());

                Login prestadorInfo = a.getPrestadorInfo();
                String prestadorName = (prestadorInfo != null) ? prestadorInfo.getNome() : a.getPrestador();
                item.put("prestador", prestadorName);
                item.put("prestadorDoc", a.getPrestador());

                String serviceName = getServiceName(a.getService());
                item.put("service", (serviceName != null) ? serviceName : a.getService());

                item.put("date", (a.getDate() != null) ? a.getDate().toString() : null);
                item.put("time", a.getTime());
                item.put("price", a.getPrice());
                result.add(item);
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/specialties-by-name/{serviceName}")
    public ResponseEntity<?> listSpecialtiesByServiceName(@PathVariable String serviceName) {
        try {
            var rows = jdbcTemplate.queryForList(
                "SELECT s1.cod_serv1 AS code, s1.descr_serv1 AS name FROM servico1 s1 " +
                "INNER JOIN servico s ON s.cod_serv = s1.cod2_serv1 " +
                "WHERE s.classe_serv = ? ORDER BY s1.descr_serv1 ASC",
                serviceName);
            return ResponseEntity.ok(rows);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
