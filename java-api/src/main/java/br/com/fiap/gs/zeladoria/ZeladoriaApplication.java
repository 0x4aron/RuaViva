package br.com.fiap.gs.zeladoria;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@OpenAPIDefinition(info = @Info(
        title = "API de zeladoria urbana - CitizenTech",
        version = "1.0",
        description = "Global Solution FIAP 2026.2 - registro, apoio e priorizacao de problemas de zeladoria do bairro"))
@SpringBootApplication
public class ZeladoriaApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZeladoriaApplication.class, args);
    }
}
