# ----------- Stage 1: Build with Maven + Java 21 -----------
FROM maven:3.8.5-eclipse-temurin-21 AS build

# Set working directory inside the container
WORKDIR /app

# Copy all files from your backend folder into the container
COPY . .

# Build the Spring Boot app and skip tests
RUN ./mvnw clean package -DskipTests


# ----------- Stage 2: Run with Lightweight JDK 21 -----------
FROM eclipse-temurin:21-jdk

# Set working directory again
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port 8080 to the outside world
EXPOSE 8080

# Start the Spring Boot app
ENTRYPOINT ["java", "-jar", "app.jar"]
