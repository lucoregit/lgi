package com.lgi.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.util.Objects;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitializer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        boolean alreadySeeded = false;
        try {
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM login", Integer.class);
            if (count != null && count > 0) {
                alreadySeeded = true;
            }
        } catch (Exception e) {
            // Table doesn't exist yet or is empty
        }

        if (!alreadySeeded) {
            try {
                System.out.println("DatabaseInitializer: Populando banco de dados inicial a partir de seed.sql...");
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.setContinueOnError(true);
                populator.setIgnoreFailedDrops(true);
                populator.addScript(new ClassPathResource("db/seed.sql"));
                try (Connection connection = Objects.requireNonNull(jdbcTemplate.getDataSource()).getConnection()) {
                    populator.populate(connection);
                }
                System.out.println("DatabaseInitializer: Banco de dados populado com sucesso!");
            } catch (Exception e) {
                System.err.println("DatabaseInitializer: Erro ao popular banco: " + e.getMessage());
            }
        } else {
            System.out.println("DatabaseInitializer: Banco ja contem dados cadastrados.");
        }
    }
}
