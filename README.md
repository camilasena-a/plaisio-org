# Plaisio Org - Organização de Estudos Semanais

Uma aplicação web moderna para organização de estudos semanais no formato Kanban, desenvolvida com TypeScript, React e Vite.

## 🎯 Funcionalidades

- **Planejamento Semanal**: Organize seus estudos por semana
- **Kanban Board**: Três colunas (A Fazer, Em Progresso, Concluído)
- **Drag and Drop**: Reorganize tarefas arrastando entre colunas
- **Persistência Local**: Dados salvos automaticamente no navegador
- **Interface Limpa**: Design moderno e intuitivo com TailwindCSS

## 🚀 Tecnologias

- **React 18** com TypeScript
- **Vite** - Build tool rápida
- **TailwindCSS** - Estilização
- **Zustand** - Gerenciamento de estado
- **@dnd-kit** - Drag and drop
- **date-fns** - Manipulação de datas

## 📦 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

3. Abra o navegador em `http://localhost:5173`

## 🏗️ Build para Produção

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`.

## 📁 Estrutura do Projeto

```
src/
├── components/      # Componentes React
│   ├── Board.tsx    # Board principal com drag and drop
│   ├── Column.tsx   # Coluna do Kanban
│   ├── TaskCard.tsx # Card de tarefa
│   ├── TaskModal.tsx # Modal para criar/editar tarefas
│   ├── WeekSelector.tsx # Seletor de semana
│   └── icons.tsx    # Componentes de ícones SVG
├── store/           # Estado global (Zustand)
│   └── useStore.ts
├── types/           # Tipos TypeScript
│   └── index.ts
├── utils/           # Funções utilitárias
│   ├── constants.ts
│   └── date.ts
├── App.tsx          # Componente principal
├── main.tsx         # Entry point
└── index.css        # Estilos globais
```

## 🎨 Características

- ✅ 100% TypeScript com tipagem forte
- ✅ Componentes funcionais e reutilizáveis
- ✅ Arquitetura limpa e escalável
- ✅ Persistência automática no LocalStorage
- ✅ Interface responsiva
- ✅ Acessibilidade (ARIA labels)

## 📝 Uso

1. **Adicionar Tarefa**: Clique no botão "+" no topo de qualquer coluna
2. **Editar Tarefa**: Clique no ícone de edição no card da tarefa
3. **Mover Tarefa**: Arraste e solte entre colunas ou dentro da mesma coluna
4. **Deletar Tarefa**: Clique no ícone de lixeira no card da tarefa
5. **Navegar Semanas**: Use as setas no topo para navegar entre semanas

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Cria build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter

## 📄 Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
