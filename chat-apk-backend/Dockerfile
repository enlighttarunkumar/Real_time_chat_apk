# Use a base image with Java and Maven
FROM maven:3.8.5-openjdk-17 AS build

# Set working directory
WORKDIR /app

# Copy everything into the container
COPY . .

# Build the project
RUN ./mvnw clean package -DskipTests

# Use a lightweight Java runtime for deployment
FROM eclipse-temurin:17-jdk

WORKDIR /app

# Copy the jar from the build stage
COPY --from=build /app/target/*.jar app.jar

# Expose port (if needed)
EXPOSE 8080

# Run the jar
ENTRYPOINT ["java", "-jar", "app.jar"]
