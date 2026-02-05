# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Canvas-editor is a rich text editor built with Canvas/SVG rendering. It provides a full-featured WYSIWYG editor similar to Microsoft Word, supporting tables, images, controls, watermarks, headers/footers, and more.

**Key Technologies:**
- TypeScript (strict mode enabled)
- Canvas API for rendering
- Vite for building
- Cypress for E2E testing

## Development Commands

### Build & Development
```bash
# Install dependencies
yarn

# Development server (DO NOT run after completing tasks)
npm run dev

# Build library (for npm package distribution)
npm run lib

# Build demo app
npm run build

# Preview production build
npm run serve
```

### Quality Assurance
```bash
# Run linter
npm run lint

# Type checking
npm run type:check

# Run all Cypress tests
npm run cypress:run

# Open Cypress test runner
npm run cypress:open
```

### Documentation
```bash
# Run VitePress documentation locally
npm run docs:dev

# Build documentation
npm run docs:build

# Preview built documentation
npm run docs:preview
```

### Release
```bash
# Publish to npm (requires dist/ to exist)
npm run release
```

## Code Architecture

### Core Structure

The editor follows a modular architecture centered around the `Draw` class:

```
src/editor/
├── core/               # Core engine modules
│   ├── draw/          # Main rendering engine (Draw class)
│   ├── command/       # Command pattern for all editor operations
│   ├── cursor/        # Cursor management
│   ├── event/         # Event handling (Canvas & Global)
│   ├── history/       # Undo/Redo management
│   ├── position/      # Position calculation and management
│   ├── range/         # Selection range management
│   ├── contextmenu/   # Right-click menu system
│   ├── shortcut/      # Keyboard shortcuts
│   ├── listener/      # Event listeners for external integrations
│   ├── observer/      # Observers (scroll, selection, image)
│   ├── zone/          # Zone management (header, main, footer)
│   ├── register/      # Plugin registration system
│   └── worker/        # Web Worker for performance
│
├── dataset/           # Constants and enums
│   ├── constant/      # All constant values
│   └── enum/          # All TypeScript enums
│
├── interface/         # TypeScript interfaces/types
│
└── utils/             # Utility functions
```

### Main Classes

**Editor (index.ts):** Main entry point that initializes:
- `Draw`: Core rendering engine
- `Command`: All editing operations (via CommandAdapt)
- `Listener`: External event listeners
- `ContextMenu`: Right-click menu system
- `Shortcut`: Keyboard shortcut system
- `Register`: Plugin registration
- `EventBus`: Internal event bus
- `Override`: Method override system

**Draw (core/draw/Draw.ts):** Central rendering engine managing:
- Canvas rendering and page layout
- Element positioning and metrics
- Frame elements (header, footer, margin, watermark, page numbers)
- Interactive features (search, selection, cursor)
- Control rendering (checkbox, select, radio, text, date)

**Command & CommandAdapt:** Command pattern implementation. All editor operations go through Command methods (e.g., `executeInsertTable`, `executeBold`, `executeUndo`).

### Particle System

Elements are rendered using specialized "Particle" classes in `core/draw/particle/`:
- `TextParticle`: Text rendering
- `ImageParticle`: Image handling
- `TableParticle`: Table rendering
- `HyperlinkParticle`: Links
- `CheckboxParticle`, `RadioParticle`: Form controls
- `LaTexParticle`: Math formulas
- `DateParticle`: Date picker
- `BlockParticle`: Block elements (video, iframe)
- `ListParticle`: Ordered/unordered lists
- `SeparatorParticle`: Horizontal separators
- `LabelParticle`: Label elements

### Element Data Structure

All content is represented as `IElement[]` arrays. Each element has:
- `value`: Text content or element-specific data
- `type`: ElementType enum (text, image, table, hyperlink, etc.)
- Style properties: font, size, bold, italic, color, etc.
- Positional data: calculated during rendering

The editor supports three zones: header, main body, and footer.

### Control System

Form controls (`core/draw/control/`) provide interactive form elements:
- `CheckboxControl`
- `SelectControl`
- `RadioControl`
- `TextControl`
- `DateControl`
- `NumberControl`
- `RichtextControl`

Controls support validation, data binding, and various configurations.

## TypeScript Configuration

**Strict mode is enforced:**
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noImplicitReturns: true`
- **NEVER use `any` type** - this is a critical requirement

Target: ESNext with DOM support

## Code Style

**ESLint rules:**
- No semicolons (enforced)
- Single quotes (enforced)
- `@typescript-eslint/no-explicit-any: 0` in ESLint BUT project instructions forbid `any` usage
- No console/debugger in production
- Template literals allowed

**Pre-commit hooks:**
- Runs linting
- Runs type checking
- Validates commit message format

## Commit Message Format

Follow conventional commits:
```
type(scope?): subject

# Types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, release, improve
# Examples:
feat: add lineWidth and color to the separator #674
fix: IME position error #155
docs: update API documentation
```

## Testing

**Cypress E2E tests** cover:
- Editor initialization
- Menu operations (format, table, hyperlink, image, etc.)
- Control interactions (checkbox, select, text)
- Core editing features

Test files in `cypress/e2e/` mirror the feature structure.

## Build Modes

**Library mode (`npm run lib`):**
- Entry: `src/editor/index.ts`
- Outputs: UMD and ES modules to `dist/`
- CSS injected via JavaScript
- TypeScript declarations generated
- Only includes `/src/editor/**` files

**App mode (`npm run build`):**
- Entry: `src/main.ts`
- Builds demo application
- Base path: `/canvas-editor/`

## Plugin System

Plugins use the `Plugin` class and can be registered via `editor.use()`:
- Example: markdown plugin, copy plugin
- Plugins can extend editor functionality without modifying core code

## Key Design Patterns

1. **Command Pattern**: All operations go through Command class
2. **Observer Pattern**: Multiple observers for scroll, selection, images
3. **Particle System**: Each element type has a dedicated renderer
4. **Event Bus**: Internal pub/sub for loose coupling
5. **Zone System**: Separate zones for header/main/footer content

## Performance Considerations

- Web Workers (`core/worker/`) for heavy computations
- Canvas-based rendering for performance
- Virtual scrolling for large documents
- Lazy loading for images

## Important Notes

- The codebase uses Chinese comments in some places (e.g., `// 通过CommandAdapt中转避免直接暴露编辑器上下文`)
- Element lists must be formatted using `formatElementList()` before rendering
- Range management is critical for selection and editing operations
- Position calculations are complex and handled by the `Position` class
