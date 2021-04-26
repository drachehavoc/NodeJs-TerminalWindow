# NodeJs-TerminalWindow
forma fácil de controlar interfaces no terminal

## Bugs conhecidos
- [ ] se uma linha conter algum caracter de escape como por exemplo (\x1b[36m), este só tera efeito se a posição da linha mostrar este caracter.
- [ ] assim como no erro anterior, se um carecter de escape estiver sendo apresentado em uma linha a mesma não sera apresentada até o final pois o caracter de escape é contado como mais de um caracter para a função substring utilizada para contar a linha.

## Roadmap
- [x] criar uma janela que possa ser usada como menu
- [x] criar janela que possa ter multiplos paines que possam ser mostrados ou escondido (abas)
- [x] permitir setar o scroll fixado em baixo (para melhor a visão de logs em tempo real)
- [ ] criar um comando para limpar painel (tipo o clear screen)
- [ ] corrigir o bug dos caracteres de escape