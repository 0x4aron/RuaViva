package br.com.fiap.gs.zeladoria.bo;

import java.time.LocalDate;
import java.time.ZoneId;

/**
 * Data de "hoje" sempre no horario de Sao Paulo.
 * O servidor do Render usa UTC: sem isso, depois das 21h o sistema ja gravaria o dia seguinte.
 */
final class Datas {

    private static final ZoneId FUSO_SAO_PAULO = ZoneId.of("America/Sao_Paulo");

    private Datas() {
    }

    static LocalDate hoje() {
        return LocalDate.now(FUSO_SAO_PAULO);
    }
}
