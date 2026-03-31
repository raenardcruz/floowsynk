# Project Structure & Organization

## Root Level Structure
```
floowsynk/
├── App/                    # Vue.js frontend application
├── Server/                 # Go backend server
├── Jobs/                   # Background job processors
├── Database/               # Database models and connections
├── Broker/                 # Kafka message broker utilities
├── Helper/                 # Utility functions
├── Makefile               # Build and development commands
└── docker-compose.yml     # Docker services configuration
```

## Frontend Structure (App/)
```
App/
├── src/
│   ├── components/
│   │   ├── Composable/     # Reusable UI components
│   │   │   ├── UI/         # Generic UI components (Modal, Sidebar, etc.)
│   │   │   └── Logo/       # Brand components
│   │   └── Icons/          # SVG icon assets
│   ├── views/              # Page-level components
│   │   ├── Home/           # Main application shell
│   │   ├── Login/          # Authentication
│   │   ├── Dashboard/      # Dashboard view
│   │   ├── Workflow/       # Workflow builder and management
│   │   └── [Other Views]/  # Additional feature views
│   ├── router/             # Vue Router configuration
│   └── main.ts             # Application entry point
├── public/                 # Static assets
└── package.json           # Dependencies and scripts
```

## Backend Structure (Server/)
```
Server/
├── main.go                # Server entry point
├── API.go                 # REST API endpoints
├── API.Methods.go         # API method implementations
├── struct.go              # Data structures
├── constants.go           # Application constants
├── crypto/                # Cryptographic utilities
├── workflow/              # Workflow processing logic
└── matheval/              # Mathematical expression evaluation
```

## Job Processing (Jobs/)
```
Jobs/
├── Consumer/              # Kafka message consumer
├── Interval/              # Scheduled job processor
└── ClearCache/            # Cache cleanup job
```

## Database Layer (Database/)
```
Database/
├── db.go                  # Database connection and setup
├── users.go               # User-related database operations
├── workflows.go           # Workflow data operations
├── replayData.go          # Workflow execution history
├── cache.go               # Redis cache operations
└── Feature.go             # Feature flag management
```


## Naming Conventions

### Frontend (Vue.js/TypeScript)
- **Components**: PascalCase (e.g., `PrimaryButton.vue`, `WorkflowCanvas.vue`)
- **Files**: kebab-case for assets, PascalCase for components
- **Directories**: PascalCase for component folders, camelCase for utilities
- **Methods**: camelCase
- **Constants**: UPPER_SNAKE_CASE

### Backend (Go)
- **Files**: camelCase (e.g., `main.go`, `workflow.go`)
- **Packages**: lowercase single word when possible
- **Functions**: PascalCase for exported, camelCase for private
- **Structs**: PascalCase
- **Constants**: PascalCase or UPPER_SNAKE_CASE


## File Organization Patterns

### Vue Component Structure
Each major component follows this pattern:
```
ComponentName/
├── ComponentName.vue      # Main component file
├── ComponentName.styles.css # Component-specific styles
├── ComponentName.hooks.ts # Vue composition functions
├── ComponentName.types.ts # TypeScript type definitions
├── ComponentName.constants.ts # Component constants
└── index.ts              # Export file
```

### Go Package Structure
- Each major feature has its own package
- Database operations grouped by entity
- Shared utilities in separate packages