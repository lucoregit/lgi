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
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM servico", Integer.class);
            if (count != null && count > 0) {
                alreadySeeded = true;
            }
        } catch (Exception e) {
            // Table doesn't exist or is empty
        }

        if (!alreadySeeded) {
            try {
                System.out.println("DatabaseInitializer: Seeding database from seed.sql...");
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.addScript(new ClassPathResource("db/seed.sql"));
                try (Connection connection = Objects.requireNonNull(jdbcTemplate.getDataSource()).getConnection()) {
                    populator.populate(connection);
                }
                System.out.println("DatabaseInitializer: Database seeded successfully!");
            } catch (Exception e) {
                System.err.println("DatabaseInitializer: Error seeding database: " + e.getMessage());
            }
        } else {
            System.out.println("DatabaseInitializer: Database already seeded.");
        }
    }
}
