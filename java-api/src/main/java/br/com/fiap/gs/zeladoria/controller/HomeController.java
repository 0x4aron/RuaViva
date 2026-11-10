package br.com.fiap.gs.zeladoria.controller;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/** Pagina inicial da API: confirma que ela esta no ar e mostra onde testar. */
@Hidden
@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> inicio() {
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("api", "CitizenTech de zeladoria urbana - Global Solution FIAP 2026.2");
        info.put("status", "no ar");
        info.put("documentacao", "/swagger-ui.html");
        info.put("recursos", new String[]{"/subprefeituras", "/distritos", "/categorias", "/cidadaos",
                "/pontos-sensiveis", "/equipes", "/ocorrencias", "/apoios", "/atendimentos"});
        return info;
    }
}
