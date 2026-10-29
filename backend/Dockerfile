# Etapa 1: Compilação do Backend com Maven
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# Etapa 2: Imagem final enxuta com JRE 17
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Cria pasta de dados para o banco H2 persistente
RUN mkdir -p /app/data
VOLUME /app/data

COPY --from=build /app/target/lgi-backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]
