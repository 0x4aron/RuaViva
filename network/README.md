# Network Architect Solutions — rede da base de zeladoria

Local físico: base de zeladoria da Subprefeitura Sé, que atende a Liberdade.

## Plano de endereçamento

O slide pede a faixa `192.168.X.0/24`. O professor confirmou que **cada setor pode ter o seu próprio X**, à escolha da equipe. Exemplo dado por ele: Equipe `192.168.10.0`, Cidadão `192.168.20.0`, Servidores `192.168.30.0`.

Usamos o mesmo número para a VLAN e para o terceiro octeto da rede, para ficar fácil de lembrar:

| Setor | VLAN | Rede | Gateway (subinterface do roteador) |
|---|---|---|---|
| Equipe (funcionários da base) | 10 | 192.168.10.0/24 | 192.168.10.1 |
| Cidadão (Wi-Fi público) | 20 | 192.168.20.0/24 | 192.168.20.1 |
| Servidores/Sensores | 30 | 192.168.30.0/24 | 192.168.30.1 |

_O restante (DHCP, NAT, ACL, SSH, WPA2 e os testes) será detalhado aqui._
