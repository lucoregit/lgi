package com.lgi.repository;

import com.lgi.model.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

    public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

        // Filtra por ano/mês E pelo prestador (pre_id), para não vazar agendamentos entre usuários
        @Query("SELECT a FROM Appointment a WHERE YEAR(a.date) = :year AND MONTH(a.date) = :month AND a.prestador = :prestadorId")
        List<Appointment> findByYearMonthAndPrestador(@Param("year") int year, @Param("month") int month, @Param("prestadorId") String prestadorId);

        List<Appointment> findByPrestador(String prestador);

        List<Appointment> findByClient(String client);
    }
