# ----------- Stage 1: Build with Maven + Java 21 -----------
FROM maven:3.9.6-eclipse-temurin-21 AS build

WORKDIR /app
COPY . .
RUN ./mvnw clean package -DskipTests


# ----------- Stage 2: Run with Lightweight Java 21 -----------
FROM eclipse-temurin:21-jdk

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
