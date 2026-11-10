package br.com.fiap.gs.zeladoria.dao;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import java.sql.Date;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDate;

/** Metodos auxiliares usados por todas as classes DAO. */
final class DaoUtil {

    private DaoUtil() {
    }

    /** Preenche os parametros (?) de um INSERT. */
    @FunctionalInterface
    interface Parametros {
        void preencher(PreparedStatement ps) throws SQLException;
    }

    /**
     * Executa um INSERT e devolve o ID gerado pela coluna IDENTITY do Oracle.
     * colunaId: nome da coluna da chave primaria (ex.: "ID_CATEGORIA").
     */
    static Long inserir(JdbcTemplate jdbc, String sql, String colunaId, Parametros parametros) {
        KeyHolder chave = new GeneratedKeyHolder();
        jdbc.update(con -> {
            PreparedStatement ps = con.prepareStatement(sql, new String[]{colunaId});
            parametros.preencher(ps);
            return ps;
        }, chave);
        return chave.getKey().longValue();
    }

    /** LocalDate (Java) -> DATE (banco). */
    static Date paraSql(LocalDate data) {
        return data == null ? null : Date.valueOf(data);
    }

    /** DATE (banco) -> LocalDate (Java). */
    static LocalDate paraLocalDate(Date data) {
        return data == null ? null : data.toLocalDate();
    }

    /** Boolean (Java) -> 'S'/'N' (banco); null vira 'N'. */
    static String paraFlag(Boolean valor) {
        return Boolean.TRUE.equals(valor) ? "S" : "N";
    }

    /** 'S'/'N' (banco) -> boolean (Java). */
    static boolean deFlag(String valor) {
        return "S".equals(valor);
    }
}
