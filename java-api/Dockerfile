# Etapa 1: compila o projeto com Maven e gera o .jar
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q package -DskipTests

# Etapa 2: imagem final, so com o Java e o .jar
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/zeladoria-api.jar app.jar
EXPOSE 8080
# Limita a memoria para caber no plano gratuito do Render (512 MB):
# heap de no maximo 60% e coletor de lixo simples, que gasta menos memoria
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=60", "-XX:+UseSerialGC", "-jar", "app.jar"]
