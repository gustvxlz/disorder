# Projeto

DISORDER é um jogo indie 3D de terror psicológico em primeira pessoa.

Stack:

- JavaScript
- Three.js
- Vite
- HTML
- CSS

Deploy: GitHub Pages.

# Princípios

- Manter o código simples, modular, legível, fácil de explicar e fácil de auditar.
- Evitar abstrações, arquivos gigantes e dependências desnecessárias.
- Não reescrever sistemas funcionais sem motivo.
- Não fazer alterações fora do escopo solicitado.
- Corrigir erros antes de prosseguir.

# Arquivos

Evitar arquivos JavaScript enormes. Quando um sistema crescer significativamente, separar responsabilidades.

# Performance

Performance é prioridade. O jogo deve funcionar em computadores modestos.

Sempre considerar:

- draw calls;
- triângulos;
- memória;
- texturas;
- luzes;
- sombras;
- atualizações desnecessárias.

# Assets

Preferir:

- GLB;
- WebP;
- áudio comprimido;
- texturas pequenas.

Arquivos `.blend` devem ficar em `source-assets/blender/` e nunca devem ser carregados pelo jogo.

# GitHub Pages

Nunca utilizar recursos que exijam backend em runtime.

Nunca depender de:

- Node server;
- Python server;
- PHP;
- banco de dados;
- filesystem do servidor.

O jogo final precisa funcionar como site estático. Usar caminhos relativos ou compatíveis com o `base` do Vite; não presumir publicação na raiz do domínio.

# Testes

Depois de alterações importantes, executar:

```sh
npm run build
```

Corrigir todos os erros antes de considerar a tarefa terminada. Também verificar warnings relevantes.

# Git

Criar commits pequenos e compreensíveis.

Não fazer commit de:

- `node_modules`;
- `dist`;
- arquivos temporários;
- cache;
- arquivos enormes desnecessários.

# Dependências

Antes de instalar nova biblioteca, verificar se realmente é necessária. Three.js deve continuar sendo a principal dependência gráfica.
