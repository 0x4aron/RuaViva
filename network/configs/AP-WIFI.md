# AccessPoint-PT e Laptop do cidadão

Use **AccessPoint-PT** (ponto de acesso autônomo) e **Laptop-PT**. O AP não tem CLI: configure pela aba **Config**. Ele faz a ponte entre Wi-Fi e a porta de acesso da VLAN 20; DHCP, gateway e NAT ficam no R1.

## Ponto de acesso

1. Renomeie o dispositivo para `AP-WIFI` em **Config > GLOBAL > Settings > Display Name**.
2. Ligue **Port 0** do AP à **FastEthernet0/2** do SW1 com **Copper Straight-Through** (cabo direto).
3. Em **Config > INTERFACE > Port 0**, marque **Port Status: On**. Mantenha velocidade e duplex automáticos.
4. Em **Config > INTERFACE > Port 1** (rádio), marque **Port Status: On**.
5. Em **SSID**, digite `RuaViva-Cidadao`; selecione o canal **6**.
6. Em **Authentication**, selecione **WPA2-PSK**; em **Encryption Type**, use **AES**.
7. No campo **PSK Pass Phrase / Pass Phrase**, digite `RuaViva2026!Troque`.

**Senha de exemplo: troque por uma senha própria, de 8 a 63 caracteres ASCII, e use a mesma no laptop.** “Público” descreve o público atendido; o acesso usa WPA2 com senha disponibilizada aos cidadãos pela base.

O AccessPoint-PT básico não precisa de IP de gerenciamento e não possui servidor DHCP. Não procure campos de IP no Port 0 nem configure trunk no AP: a associação à VLAN 20 ocorre no SW1. As opções do rádio estão descritas na [ajuda oficial do Packet Tracer](https://tutorials.ptnetacad.net/help/default/config_others.htm).

## Laptop com WPC300N

1. Renomeie o **Laptop-PT** para `LAPTOP-CIDADAO` e coloque-o próximo ao AP na área lógica.
2. Abra **Physical**, desligue o laptop no botão de energia e remova o módulo Ethernet, arrastando-o para a lista de módulos.
3. Arraste **WPC300N** da lista para o slot vazio. Ligue o laptop novamente. Não use WMP300N, que é a placa do PC de mesa.
4. Abra **Desktop > PC Wireless > Connect**, clique em **Refresh**, selecione `RuaViva-Cidadao` e clique em **Connect**.
5. Quando solicitado, selecione **WPA2-Personal / WPA2-PSK**, informe a senha do AP e confirme **Connect**. Confira a associação em **Link Information**.
6. Se configurar manualmente, em **Config > INTERFACE > Wireless0** deixe a interface **On**, informe o mesmo SSID, **WPA2-PSK**, senha e **AES**. Use os mesmos parâmetros da conexão criada em PC Wireless.
7. Em **Desktop > IP Configuration**, selecione **DHCP** na interface sem fio. Aguarde a concessão.
8. Em **Desktop > Command Prompt**, execute `ipconfig /renew` e depois `ipconfig /all`. Espere IP `192.168.20.10` a `192.168.20.254`, máscara `255.255.255.0`, gateway `192.168.20.1` e DNS `192.168.30.10`.
9. Em **Desktop > Web Browser**, abra `http://ruaviva.gs` e depois `http://internet.gs`. Execute os testes de bloqueio do [README](../README.md).

Se aparecer `169.254.x.x` ou não houver IP, confira associação, senha, porta Fa0/2 na VLAN 20, trunk e DHCP do R1. A primeira regra da ACL permite DHCP em broadcast, UDP de porta 68 para 67, inclusive Discover de `0.0.0.0` para `255.255.255.255`. A segunda permite renovação unicast do cliente da VLAN 20 ao gateway `192.168.20.1`.
