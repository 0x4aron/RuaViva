# Network Architect Solutions — RuaViva

Entrega de configurações e roteiro de montagem para **Cisco Packet Tracer 8.2**, com a sintaxe IOS 15 dos dispositivos simulados. A rede atende à **base de zeladoria da Subprefeitura Sé**, responsável pela Liberdade, São Paulo. O RuaViva recebe ocorrências urbanas, prioriza demandas pelo impacto e apoia o planejamento das equipes de campo. A página HTTP contém a Ficha completa do [README da raiz](../README.md).

**Equipe:** Anthony Gonçalves Sforzin — RM 562096; Cesar Aaron Herrera — RM 565398.

## Plano aprovado pelo professor

O enunciado pede `192.168.X.0/24`. O professor confirmou que **cada setor pode ter seu próprio X**. Preservamos as três redes /24 aprovadas, sem subdividir uma única /24 em redes menores:

| Setor | VLAN | Rede | Gateway no R1 |
|---|---|---|---|
| Equipe (funcionários da base) | 10 | 192.168.10.0/24 | 192.168.10.1 |
| Cidadão (Wi-Fi público) | 20 | 192.168.20.0/24 | 192.168.20.1 |
| Servidores/Sensores | 30 | 192.168.30.0/24 | 192.168.30.1 |

## Arquivos e uso

- [configs/R1-BASE.txt](configs/R1-BASE.txt): gateways, DHCP, NAT/PAT, ACL e SSH.
- [configs/SW1.txt](configs/SW1.txt): VLANs, trunk, portas de acesso e gerenciamento.
- [configs/ISP.txt](configs/ISP.txt): provedor e rede externa simulada.
- [configs/AP-WIFI.md](configs/AP-WIFI.md): cliques no AP e instalação/conexão da WPC300N.
- [servidor/index.html](servidor/index.html): Ficha da CitizenTech para o SRV-RUAVIVA.
- [servidor/internet.html](servidor/internet.html): conteúdo do `index.html` do SERVIDOR-INTERNET.

Os arquivos IOS são para dispositivos novos. Começam com `enable` e `configure terminal`, e terminam com `end` e `write memory`. Os comentários `!` podem acompanhar a colagem. **Troque todas as senhas de exemplo antes da entrega:** `Gs2026!Troque` (admin, enable e console) e `RuaViva2026!Troque` (Wi-Fi). Use senhas distintas por finalidade e atualize a senha no laptop. Não exponha senhas nos prints.

Este material não contém um `.pkt` executado nem um PDF com evidências. A montagem, os testes e os prints reais devem ser feitos no PT conforme o roteiro. Salve o projeto como `network/RuaViva.pkt` e mantenha as evidências em `network/`.

## Topologia

```text
PC-EQUIPE Fa0 (DHCP / VLAN 10) -------- SW1 Fa0/1
AP-WIFI Port 0 (VLAN 20) ------------- SW1 Fa0/2
    ))) LAPTOP-CIDADAO (WPC300N / DHCP)
SRV-RUAVIVA Fa0 (192.168.30.10) ------ SW1 Fa0/3
PC-SENSOR Fa0 (DHCP / VLAN 30) ------- SW1 Fa0/4

                      SW1 (2960-24TT) Gi0/1
                                |
                       trunk 802.1Q: 10,20,30
                                |
                      R1-BASE (2911) Gi0/0
                      subinterfaces .10/.20/.30
                      Gi0/1: 200.10.0.2/30
                                |
                        enlace 200.10.0.0/30
                                |
                      ISP (2911) Gi0/0: 200.10.0.1/30
                                 Gi0/1: 8.8.8.1/24
                                |
                      SERVIDOR-INTERNET Fa0
                             8.8.8.8/24
```

| Dispositivo / modelo | Porta local | Conecta à porta | Cabo / meio |
|---|---|---|---|
| R1-BASE / Cisco 2911 | GigabitEthernet0/0 | SW1 GigabitEthernet0/1 | Copper Straight-Through (direto) |
| R1-BASE / Cisco 2911 | GigabitEthernet0/1 | ISP GigabitEthernet0/0 | Copper Cross-Over (cruzado) |
| ISP / Cisco 2911 | GigabitEthernet0/1 | SERVIDOR-INTERNET FastEthernet0 | Copper Cross-Over (cruzado) |
| SW1 / 2960-24TT | FastEthernet0/1 | PC-EQUIPE FastEthernet0 | Direto |
| SW1 / 2960-24TT | FastEthernet0/2 | AP-WIFI Port 0 | Direto |
| SW1 / 2960-24TT | FastEthernet0/3 | SRV-RUAVIVA FastEthernet0 | Direto |
| SW1 / 2960-24TT | FastEthernet0/4 | PC-SENSOR FastEthernet0 | Direto |
| AP-WIFI / AccessPoint-PT | Port 1 (rádio) | LAPTOP-CIDADAO Wireless0 / WPC300N | Wi-Fi, sem cabo |
| PC-EQUIPE e PC-SENSOR / PC-PT | FastEthernet0 | Conforme linhas acima | Dois PCs, um em cada VLAN indicada |
| SRV-RUAVIVA e SERVIDOR-INTERNET / Server-PT | FastEthernet0 | Conforme linhas acima | Dois servidores distintos |

Não há serial, módulo WAN adicional ou `clock rate`. O PC-SENSOR representa um sensor para testar o terceiro pool. Fa0/5–24 e Gi0/2 do SW1 e Gi0/2 dos roteadores ficam desligadas.

**Modelos:** use **2911 nos dois roteadores** para colar os arquivos sem alterações. Se usar ISR4331, adapte `GigabitEthernet0/0` para `GigabitEthernet0/0/0` e `GigabitEthernet0/1` para `GigabitEthernet0/0/1`, inclusive nas subinterfaces, no PAT e nas descrições; confira a terceira porta em `show ip interface brief` antes de adaptar seu bloco. A subinterface seria `GigabitEthernet0/0/0.10`. Não misture as numerações dos modelos.

## Endereçamento completo

| Segmento | Máscara | Hosts utilizáveis | Broadcast | Gateway / próximo salto | DHCP |
|---|---|---|---|---|---|
| 192.168.10.0/24 | 255.255.255.0 | .1–.254 | 192.168.10.255 | 192.168.10.1 | 192.168.10.10–192.168.10.254 |
| 192.168.20.0/24 | 255.255.255.0 | .1–.254 | 192.168.20.255 | 192.168.20.1 | 192.168.20.10–192.168.20.254 |
| 192.168.30.0/24 | 255.255.255.0 | .1–.254 | 192.168.30.255 | 192.168.30.1 | 192.168.30.11–192.168.30.254 |
| 200.10.0.0/30 | 255.255.255.252 | 200.10.0.1–200.10.0.2 | 200.10.0.3 | R1 usa 200.10.0.1 | Sem DHCP |
| 8.8.8.0/24 | 255.255.255.0 | 8.8.8.1–8.8.8.254 | 8.8.8.255 | 8.8.8.1 | Sem DHCP |

| IP fixo | Dispositivo / interface | Observação |
|---|---|---|
| 192.168.10.1/24 | R1 Gi0/0.10 | Gateway Equipe |
| 192.168.20.1/24 | R1 Gi0/0.20 | Gateway Cidadão |
| 192.168.30.1/24 | R1 Gi0/0.30 | Gateway Servidores/Sensores |
| 192.168.10.2/24 | SW1 interface Vlan10 | Gerenciamento; gateway 192.168.10.1 |
| 192.168.30.10/24 | SRV-RUAVIVA Fa0 | Gateway 192.168.30.1; DNS 192.168.30.10 |
| 200.10.0.2/30 | R1 Gi0/1 | IP público do PAT |
| 200.10.0.1/30 | ISP Gi0/0 | Enlace com R1 |
| 8.8.8.1/24 | ISP Gi0/1 | Gateway externo |
| 8.8.8.8/24 | SERVIDOR-INTERNET Fa0 | Gateway 8.8.8.1; DNS 8.8.8.8 (serviço opcional) |

Todos os pools entregam DNS `192.168.30.10` e gateway `.1` da própria VLAN. `.1` a `.9` de cada VLAN estão excluídos do DHCP; `192.168.30.10` também está excluído. Rede `.0` e broadcast `.255` não são atribuíveis. O AP é uma ponte sem IP neste modelo. PCs e laptop não têm IP fixo; registre os endereços realmente concedidos nos testes.

`200.10.0.0/30` e `8.8.8.0/24` são usados somente no laboratório isolado. `8.8.8.8` representa nosso Server-PT, não uma conexão ao serviço real da internet.

## VLANs, roteamento e NAT/PAT

O SW1 separa os setores por portas de acesso. Gi0/1 transporta VLANs **10, 20 e 30** por trunk **IEEE 802.1Q**. O 2960 já usa 802.1Q: não inclua `switchport trunk encapsulation dot1q`, ausente nesse modelo. A VLAN nativa padrão é 1; não há hosts nela e ela não está na lista de VLANs permitidas.

O R1 faz **router-on-a-stick**: Gi0/0 não tem IP; Gi0/0.10, .20 e .30 têm `encapsulation dot1Q 10/20/30` e os gateways. Não é necessário `ip helper-address`, pois o próprio R1 atende DHCP nas redes diretamente conectadas. O SW1 não roteia entre VLANs. A [referência Cisco de router-on-a-stick](https://learningnetwork.cisco.com/s/article/fundamentals-of-vlan-s-router-on-a-stick) descreve o uso de subinterfaces e tags 802.1Q.

As três subinterfaces são `ip nat inside`; Gi0/1 é `ip nat outside`. A ACL padrão 1 seleciona somente as três redes internas. `ip nat inside source list 1 interface GigabitEthernet0/1 overload` traduz clientes para **200.10.0.2**, distinguindo fluxos por portas. O tráfego entre VLANs não cruza a interface externa. A rota default do R1 aponta para `200.10.0.1`. Veja a [referência Cisco de NAT/PAT](https://www.cisco.com/c/en/us/support/docs/ip/network-address-translation-nat/13772-12.html).

**Retorno no ISP:** `200.10.0.0/30` já é diretamente conectada a Gi0/0. O ISP alcança o IP público `200.10.0.2` sem rota estática adicional; o retorno tem esse destino e o R1 desfaz o PAT. **Não crie rotas para as três VLANs privadas no ISP**, pois elas mascarariam problemas de NAT. O ISP também tem a rota conectada `8.8.8.0/24`; a internet simulada termina nesse servidor, sem rota default no ISP.

## Serviços dos Server-PT

### SRV-RUAVIVA: DNS e HTTP

1. Em **Desktop > IP Configuration > Static**, configure `192.168.30.10`, máscara `255.255.255.0`, gateway `192.168.30.1` e DNS `192.168.30.10`.
2. Em **Services > DNS**, marque **On**. Para cada linha abaixo, preencha **Name**, selecione **Type: A Record**, preencha **Address** e clique **Add**:

   | Name | Type | Address |
   |---|---|---|
   | ruaviva.gs | A Record | 192.168.30.10 |
   | internet.gs | A Record | 8.8.8.8 |

3. Em **Services > HTTP**, marque **HTTP: On** e **HTTPS: Off** para usar TCP 80 nos testes.
4. Na lista de arquivos, abra **index.html > Edit**, substitua todo o conteúdo pelo arquivo [servidor/index.html](servidor/index.html) e clique **Save**. Confirme a substituição, se solicitado.
5. Deixe **Services > DHCP: Off**: os três pools ficam exclusivamente no R1. Outros serviços não são necessários.

O HTML contém a Ficha real, a participação de cada disciplina e os nomes/RMs. Usa tags básicas, tabelas e entidades HTML, sem CSS ou JavaScript. É uma página de apresentação; não executa a API do MVP. Links externos da Ficha são referências e não estão hospedados na internet simulada.

### SERVIDOR-INTERNET: destino externo

1. Em **Desktop > IP Configuration > Static**, configure `8.8.8.8`, máscara `255.255.255.0`, gateway `8.8.8.1` e DNS `8.8.8.8`.
2. Em **Services > HTTP**, marque **HTTP: On**, **HTTPS: Off**. Edite o **index.html** padrão, cole [servidor/internet.html](servidor/internet.html) e salve. O arquivo de origem é `internet.html`, mas **o nome publicado deve ser `index.html`** para abrir em `http://internet.gs`.
3. Opcional: em **Services > DNS > On**, adicione `internet.gs`, tipo **A Record**, endereço `8.8.8.8`. Os clientes internos usam o SRV-RUAVIVA, portanto HTTP e PAT funcionam sem este DNS externo.
4. Deixe **DHCP: Off**.

## Segurança e ACL, linha a linha

A ACL estendida `WIFI_CIDADAO_IN` é aplicada com `ip access-group WIFI_CIDADAO_IN in` **somente em Gi0/0.20 do R1**. A primeira regra que corresponde ao pacote decide:

| Ordem | Linha exata | Efeito |
|---|---|---|
| 1 | `permit udp any eq 68 host 255.255.255.255 eq 67` | Libera DHCP em broadcast (bootpc/68 → bootps/67), inclusive antes de obter IP. |
| 2 | `permit udp 192.168.20.0 0.0.0.255 eq 68 host 192.168.20.1 eq 67` | Libera renovação DHCP unicast do cliente para o R1, servidor DHCP da VLAN 20. |
| 3 | `permit udp 192.168.20.0 0.0.0.255 host 192.168.30.10 eq 53` | Libera DNS UDP para o servidor da solução. |
| 4 | `permit tcp 192.168.20.0 0.0.0.255 host 192.168.30.10 eq 80` | Libera HTTP para o mesmo servidor. |
| 5 | `deny ip any 192.168.10.0 0.0.0.255` | Bloqueia a Equipe, inclusive seu gateway e o gerenciamento do switch. |
| 6 | `deny ip any 192.168.30.0 0.0.0.255` | Bloqueia o restante da VLAN 30: outros hosts e demais protocolos do servidor, inclusive ping e HTTPS. |
| 7 | `deny tcp 192.168.20.0 0.0.0.255 any eq 22` | Impede que o Wi-Fi público tente SSH em qualquer roteador, inclusive a administração do ISP (200.10.0.1). |
| 8 | `permit ip 192.168.20.0 0.0.0.255 any` | Libera outros destinos, incluindo a internet simulada, para clientes com IP da VLAN 20. |
| Implícita | `deny ip any any` | Descarta o que não correspondeu às linhas anteriores; não precisa ser digitada. |

**DHCP:** Discover/Request podem sair de `0.0.0.0:68` para `255.255.255.255:67`. Uma permissão limitada à origem `192.168.20.0/24` não bastaria. Por isso a regra 1 aceita o broadcast mesmo sem IP; a regra 2 permite renovação unicast ao gateway. Offer/ACK saem pela subinterface e esta ACL filtra somente a entrada. As exceções UDP 68→67 não liberam destinos nas VLANs 10 ou 30. No SRV-RUAVIVA o DHCP fica desligado e os únicos serviços disponíveis ao cidadão são DNS UDP e HTTP.

DNS/HTTP precisam vir antes do bloqueio da VLAN 30. DNS TCP não foi liberado: o exercício usa consultas A simples por UDP no Server-PT. A ACL não mantém estado: ping **da Equipe ao laptop** também falha, pois a resposta ICMP do laptop para a VLAN 10 seria bloqueada. Demonstre o roteamento permitido com **Equipe ↔ Servidores/Sensores**.

O roteador não filtra tráfego que permanece no mesmo segmento Wi-Fi: esta ACL não isola cidadãos entre si. A última permissão também alcança endereços locais fora das duas redes bloqueadas. Por isso o SSH do R1 tem proteção própria: `VTY_EQUIPE` admite somente origem `192.168.10.0/24`.

**SSH:** R1, ISP e SW1 têm hostname, domínio `ruaviva.gs`, RSA 1024 para este laboratório, SSH v2, usuário local `admin`, `enable secret`, console autenticado e banner. `login local` e `transport input ssh` nas VTY recusam Telnet. R1/ISP usam VTY 0–4; SW1 cobre VTY 0–15. O console físico permanece disponível com senha. `service password-encryption` ofusca senhas de linha; não substitui `secret` nem oferece proteção criptográfica forte para essas senhas.

**Wi-Fi:** SSID `RuaViva-Cidadao`, WPA2-PSK/AES e senha de exemplo a substituir. Siga [AP-WIFI.md](configs/AP-WIFI.md); o AccessPoint-PT não tem CLI.

## Montagem no Packet Tracer, na ordem

1. Crie um projeto vazio. Adicione **dois 2911**, **um 2960-24TT**, **um AccessPoint-PT**, **dois Server-PT**, **dois PC-PT** e **um Laptop-PT**. Renomeie e conecte conforme a tabela.
2. Abra a **CLI** do SW1. Nos roteadores, responda `no` a `Would you like to enter the initial configuration dialog?` e pressione Enter quando necessário. A colagem começa no EXEC (`Switch>`/`Router>` ou `#`), não dentro de `(config)#`.
3. Cole **SW1.txt**, depois **R1-BASE.txt**, depois **ISP.txt**. Aguarde a geração RSA. Se a colagem longa perder comandos durante essa geração, cole até essa linha, espere o prompt e cole o restante. Confira `% Invalid input`, `% Incomplete command` ou outros erros antes de prosseguir. Não regenere chaves sem necessidade.
4. Aguarde links verdes. Confira `show ip interface brief` nos roteadores e `show interfaces trunk` no switch. Interfaces físicas e subinterfaces usadas precisam estar ativas.
5. Configure os dois servidores e publique os respectivos `index.html`. Adicione os dois registros A no SRV-RUAVIVA.
6. Configure o AP, instale a WPC300N com o laptop desligado e associe-o ao SSID, seguindo [AP-WIFI.md](configs/AP-WIFI.md).
7. Em **Desktop > IP Configuration**, selecione **DHCP** no PC-EQUIPE, PC-SENSOR e LAPTOP-CIDADAO. Confira IPs, gateways e DNS. Não fixe `.10` manualmente nos clientes.
8. Execute o roteiro abaixo em **Realtime**. Para observar os protocolos, use **Simulation**, filtros ARP/DHCP/DNS/TCP/HTTP/ICMP e **Capture/Forward** ou **Auto Capture/Play**.
9. Salve por **File > Save As** em `network/RuaViva.pkt`. `write memory` salva o IOS, mas não substitui salvar o `.pkt` com servidores, AP e cabeamento.
10. Capture evidências reais e monte o PDF. Reabra o `.pkt` e repita os testes para conferir persistência.

## Roteiro de testes e resultados esperados

Execute `show` na **CLI do equipamento, modo privilegiado `#`** (use `enable` e sua senha). Execute comandos dos clientes em **Desktop > Command Prompt**. Os resultados abaixo são critérios de aceitação, não evidências de execução.

### 1. Interfaces, VLANs, trunk e rotas

| Onde | Comando exato | Resultado esperado |
|---|---|---|
| SW1 | `show vlan brief` | VLAN 10: Fa0/1; VLAN 20: Fa0/2; VLAN 30: Fa0/3 e Fa0/4. |
| SW1 | `show interfaces trunk` | Gi0/1 trunking, 802.1Q, VLANs 10,20,30 permitidas e encaminhando. A porta trunk não precisa aparecer como acesso em `show vlan brief`. |
| R1 | `show ip interface brief` | Gi0/0, Gi0/1 e subinterfaces .10/.20/.30 up/up. Gi0/0 sem IP é correto. |
| R1 | `show ip interface GigabitEthernet0/0.20` | ACL de entrada WIFI_CIDADAO_IN. |
| R1 | `show ip route` | Três redes internas conectadas, WAN conectada e default via 200.10.0.1. |
| ISP | `show ip route` | 200.10.0.0/30 e 8.8.8.0/24 conectadas; nenhuma rota privada das VLANs. Rotas locais /32 também podem aparecer. |
| R1 | `ping 200.10.0.1` | Respostas do ISP. |

### 2. DHCP nos três setores

No **PC-EQUIPE**, no **LAPTOP-CIDADAO** já associado e no **PC-SENSOR**, execute em cada um:

```text
ipconfig /release
ipconfig /renew
ipconfig /all
```

| Cliente | IP esperado (faixa; não necessariamente o primeiro) | Gateway | DNS |
|---|---|---|---|
| PC-EQUIPE | 192.168.10.10–254 | 192.168.10.1 | 192.168.30.10 |
| LAPTOP-CIDADAO | 192.168.20.10–254 | 192.168.20.1 | 192.168.30.10 |
| PC-SENSOR | 192.168.30.11–254 | 192.168.30.1 | 192.168.30.10 |

A máscara é `255.255.255.0` em todos. No R1, execute `show ip dhcp binding` e `show ip dhcp pool`: espere concessões nas três redes, sem IPs reservados. O servidor permanece fixo em `.30.10`. Capture obrigatoriamente a renovação do PC-EQUIPE e a do laptop **com a ACL já aplicada**, comprovando a exceção DHCP.

### 3. Ping permitido entre VLANs

No **PC-EQUIPE**:

```text
ping 192.168.10.1
ping 192.168.30.10
```

No **PC-SENSOR**:

```text
ping 192.168.10.1
```

Espere respostas: o segundo comando do PC-EQUIPE atravessa VLAN 10 → VLAN 30; o PC-SENSOR comprova VLAN 30 → gateway da VLAN 10. Se houver perda inicial por ARP, repita e capture uma sequência estável. Não use o laptop como destino de ping da Equipe, devido à política de retorno da ACL.

### 4. DNS e HTTP da solução

No **PC-EQUIPE** e no **LAPTOP-CIDADAO**, em **Desktop > Web Browser**, digite e clique **Go**:

```text
http://ruaviva.gs
```

Espere a Ficha com localização, nomes e RMs. Capture a URL e o conteúdo. O nome testa o registro A e o HTTP; no laptop também comprova as permissões UDP 53/TCP 80 antes da negação da VLAN 30. Para diagnóstico, abra `http://192.168.30.10`: se por IP abre e por nome não, confira DNS entregue pelo DHCP e o registro A.

### 5. Internet simulada e PAT

No navegador do **PC-EQUIPE** e depois do **LAPTOP-CIDADAO**, abra:

```text
http://internet.gs
```

Espere **Internet simulada**, servida por `8.8.8.8`. Logo após cada acesso, execute no **R1**:

```text
show ip nat translations
show ip nat statistics
```

Espere tradução TCP com **Inside local** igual ao IP real do cliente e sua porta de origem, **Inside global** `200.10.0.2:porta` e destino externo `8.8.8.8:80`. A porta traduzida pode coincidir com a original ou mudar. A resolução DNS ocorre internamente e não precisa produzir entrada NAT.

Para mostrar os dois clientes compartilhando o IP público, acesse a página em ambos em rápida sequência e consulte a tabela. As entradas são temporárias: se expirarem ou houver cache, faça novo acesso, por exemplo a `http://8.8.8.8`, e consulte imediatamente. Se necessário, use Simulation, avance até o HTTP atravessar o R1 e pause para capturar. Inclua a tabela de traduções, não somente a página.

### 6. ACL bloqueando e contadores

No **PC-EQUIPE**, execute `ipconfig` e anote seu IP. No **R1**, execute `show access-lists WIFI_CIDADAO_IN` antes do teste. No **LAPTOP-CIDADAO**, se a Equipe recebeu `192.168.10.10`, execute:

```text
ping 192.168.10.10
ping 192.168.30.10
```

Se o PC recebeu outro IP, substitua somente o destino do primeiro ping pelo endereço observado, por exemplo `ping 192.168.10.11`. Não teste um IP vazio. Espere **nenhuma resposta de eco** (timeout ou destino inacessível): o primeiro fluxo é barrado pela regra 5 e o segundo pela regra 6, embora HTTP para o servidor continue permitido.

No **R1**, execute imediatamente:

```text
show access-lists
show access-lists WIFI_CIDADAO_IN
```

Compare antes/depois: os `matches` devem aumentar em `deny ip any 192.168.10.0 0.0.0.255` e `deny ip any 192.168.30.0 0.0.0.255`. Capture o ping e os contadores. Se o build do PT não atualizar/exibir contadores, registre a limitação e capture também a PDU ICMP descartada no R1 em Simulation; ainda inclua `show access-lists` no PDF. A ACL 1 da mesma saída seleciona NAT e não é o filtro Wi-Fi.

### 7. SSH funcionando e Telnet recusado

No **PC-EQUIPE**:

```text
ssh -l admin 192.168.10.1
```

Informe a senha local configurada (exemplo a trocar: `Gs2026!Troque`). Espere `R1-BASE#`, pois o usuário tem privilégio 15. Execute `show ip interface brief` e depois `exit`. Na CLI local do R1, `show ip ssh` deve indicar versão 2.

De volta ao **Command Prompt do PC-EQUIPE**:

```text
telnet 192.168.10.1
```

Espere conexão recusada/fechada, sem login Telnet. Como o mesmo PC acessou por SSH, a recusa demonstra `transport input ssh`, não falta de conectividade. No **LAPTOP-CIDADAO**, `ssh -l admin 192.168.20.1` também deve falhar, agora pela ACL das VTY, restrita à Equipe.

### 8. Wi-Fi e persistência

Confira **Config > Port 1** no AP: SSID, **WPA2-PSK** e **AES**. No laptop, **PC Wireless > Link Information** deve mostrar associação. Não exponha a passphrase. Salve, reabra o `.pkt` e repita DHCP, HTTP por nome, PAT e bloqueio.

## Prints para o PDF

1. Topologia completa, com nomes, VLANs, redes e portas legíveis; tabela do plano aprovado.
2. SW1: `show vlan brief` e `show interfaces trunk`.
3. R1: `show ip interface brief` e `show ip route`; ISP: `show ip route`, com retorno conectado ao IP público e sem rotas privadas.
4. PC-EQUIPE: `ipconfig /renew` e `ipconfig /all`, mostrando IP, máscara, gateway e DNS.
5. LAPTOP-CIDADAO: os mesmos comandos com ACL ativa; PC-SENSOR e `show ip dhcp binding` para comprovar o terceiro pool.
6. Ping permitido do PC-EQUIPE para `192.168.30.10` e do PC-SENSOR para `192.168.10.1`.
7. SRV-RUAVIVA: Services > DNS com os dois registros A; navegador em `http://ruaviva.gs` com a Ficha e nomes/RMs (mais de um print, se necessário).
8. Laptop em `http://ruaviva.gs`, comprovando DNS e HTTP liberados para o cidadão.
9. Navegador em `http://internet.gs` com Internet simulada; R1 com `show ip nat translations` após o acesso, identificando Inside local/global e destino externo.
10. Laptop: ping ao **IP real do PC-EQUIPE** falhando; R1: `show access-lists` e contadores antes/depois. Inclua o ping bloqueado ao servidor.
11. PC-EQUIPE: SSH bem-sucedido e Telnet recusado; R1: `show ip ssh`.
12. AP: SSID e WPA2/AES sem revelar senha; laptop associado.

Em cada evidência, registre **origem, destino, ação, resultado esperado e resultado observado**. Inclua versão do PT, data e nomes/RMs. Use prints reais; os resultados esperados deste roteiro não substituem a execução.
