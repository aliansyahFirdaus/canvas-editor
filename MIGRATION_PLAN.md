# Migration Plan: Tiptap → Canvas Editor

> **Created**: 2026-02-05
> **Status**: ✅ Final - Ready for Implementation
> **Source**: Based on FEATURE_COMPARISON.md analysis

---

## 📋 Executive Summary

Berdasarkan analisis perbandingan fitur antara Tiptap Editor dan Canvas Editor, berikut adalah action plan untuk migrasi:

- **Fitur yang perlu ditambahkan**: 2 fitur
- **Fitur yang perlu dihapus**: 15 fitur
- **Estimasi total effort**: 3-4 minggu (jika implement semua)
- **Rekomendasi**: Fokus pada Cell Padding Control (1 minggu)

---

## ✅ FITUR YANG HARUS DITAMBAHKAN

Total: **2 fitur** dari Tiptap yang perlu diport ke Canvas Editor

### 1. 🎛️ Cell Padding Control

**Kategori:** Tables
**Prioritas:** 🟡 MEDIUM
**Estimasi:** 1 minggu
**Complexity:** Medium

#### Deskripsi
Kontrol untuk mengatur padding horizontal (X) dan vertical (Y) pada table cells secara terpisah.

#### Current State
- **Tiptap:** ✅ Ada - UI controls dengan input number untuk paddingX dan paddingY
- **Canvas:** ❌ Tidak ada - Hanya default padding

#### Features
- Input number untuk paddingX (0-20px)
- Input number untuk paddingY (0-20px)
- Apply ke selected cells atau entire table
- Real-time visual feedback
- Persist dalam data model

#### Implementation Required

**1. Interface Update**
```typescript
// src/editor/interface/table/Table.ts
interface ITableCell {
  ...existing properties,
  paddingX?: number  // Horizontal padding (0-20px)
  paddingY?: number  // Vertical padding (0-20px)
}
```

**2. Command API**
```typescript
// src/editor/core/command/CommandAdapt.ts
public executeTableCellPadding(paddingX: number, paddingY: number) {
  // Get selected cells
  // Apply padding to cells
  // Re-render table with new metrics
}
```

**3. UI Controls**
```typescript
// index.html - Add to table toolbar
<div class="table-padding-controls">
  <label>Padding X:</label>
  <input type="number" min="0" max="20" value="4" id="paddingX">

  <label>Padding Y:</label>
  <input type="number" min="0" max="20" value="4" id="paddingY">
</div>
```

**4. Rendering Update**
```typescript
// src/editor/core/draw/particle/table/TableParticle.ts
// Update cell rendering to use custom paddingX and paddingY
// Adjust metrics calculation
```

#### Benefits
- Fine-grained control over table cell spacing
- Better typography in tables
- Match user's existing Tiptap workflow
- Low implementation risk

#### Risk Assessment
- **Low Risk**: Extends existing table system
- **No Breaking Changes**: Backward compatible (default padding maintained)
- **Testing Scope**: Table rendering, metrics calculation

---

### 2. 📰 Multi-Column Layout

**Kategori:** Pagination & Page Layout
**Prioritas:** 🔴 HIGH (but high effort)
**Estimasi:** 2-3 minggu
**Complexity:** High

#### Deskripsi
Kemampuan untuk membuat layout 2 kolom per halaman (seperti layout koran/majalah).

#### Current State
- **Tiptap:** ✅ Ada - Via `ColumnBlock` dan `Column` extensions
- **Canvas:** ❌ Tidak ada

#### Features
- Toggle 2-column mode per page
- Automatic text flow dari kolom kiri ke kanan
- Content preservation saat toggle on/off
- Page break handling di tengah kolom
- Independent column width
- Visual column separator

#### Implementation Required

**1. New Element Types**
```typescript
// src/editor/dataset/enum/Element.ts
export enum ElementType {
  ...existing,
  COLUMN_BLOCK = 'columnBlock',  // Container
  COLUMN = 'column'                // Individual column
}
```

**2. Column Interface**
```typescript
// src/editor/interface/Column.ts
export interface IColumnBlock {
  columns: number  // 1 or 2
  gap?: number     // Space between columns (default: 20px)
}

export interface IColumn {
  width?: number   // Column width (default: 50%)
  valueList: IElement[]
}
```

**3. Layout Engine Refactor**
```typescript
// src/editor/core/draw/Draw.ts
// Major refactor needed:
// - Column flow calculation
// - Text wrapping within columns
// - Column height balancing
// - Cross-column page breaks
// - Cursor positioning in columns
```

**4. Command API**
```typescript
// src/editor/core/command/CommandAdapt.ts
public executeToggleColumns(enable: boolean) {
  // Convert single column ↔ multi-column
  // Preserve content during conversion
  // Re-layout entire page
}
```

**5. Rendering Updates**
```typescript
// New particle class needed
// src/editor/core/draw/particle/ColumnParticle.ts
export class ColumnParticle {
  // Render column containers
  // Handle column flow
  // Draw column separators
}
```

#### Benefits
- Major feature parity with Tiptap
- Professional document layouts
- Newsletter/magazine style documents

#### Risk Assessment
- **High Risk**: Complex rendering changes
- **Potential Breaking Changes**: Layout calculation logic
- **Testing Scope**: Extensive - pagination, rendering, cursor, selection
- **Performance Impact**: Additional layout calculations

#### Challenges
1. Canvas uses different rendering model (not DOM-based)
2. Need complete refactor of layout calculation
3. Complex text flow between columns
4. Page break logic becomes more complex
5. Cursor/selection positioning in columns
6. Export/print handling for columns

---

## ❌ FITUR YANG HARUS DIHAPUS

Total: **15 fitur** dari Canvas Editor yang tidak terpakai

### 1. Text Formatting (2 fitur)

| Fitur | Reason |
|-------|--------|
| Superscript | Jarang digunakan, tidak ada di Google Docs |
| Subscript | Jarang digunakan, tidak ada di Google Docs |

**Files to remove:**
- `src/editor/core/draw/particle/SuperscriptParticle.ts`
- `src/editor/core/draw/particle/SubscriptParticle.ts`
- Commands: `executeSuperscript()`, `executeSubscript()`
- Enum: `ElementType.SUPERSCRIPT`, `ElementType.SUBSCRIPT`

---

### 2. Form Controls (9 fitur - ENTIRE MODULE)

| Fitur | Reason |
|-------|--------|
| Text Input Control | Tidak dipakai di project |
| Select/Dropdown | Tidak dipakai di project |
| Checkbox Control | Tidak dipakai di project |
| Radio Button Control | Tidak dipakai di project |
| Date Picker Control | Tidak dipakai di project |
| Number Input Control | Tidak dipakai di project |
| Control Value Get/Set API | Tidak dipakai di project |
| Control Navigation | Tidak dipakai di project |
| Control Highlight | Tidak dipakai di project |

**Files to remove:**
```
src/editor/core/draw/control/
├── Control.ts (main control system)
├── checkbox/CheckboxControl.ts
├── date/DateControl.ts
├── interactive/ControlSearch.ts
├── number/
│   ├── Calculator.ts
│   └── NumberControl.ts
├── radio/RadioControl.ts
├── richtext/Border.ts
├── select/SelectControl.ts
└── text/TextControl.ts
```

**Additional cleanup:**
- `src/editor/interface/Control.ts`
- `src/editor/dataset/enum/Control.ts` (ControlType, ControlComponent, etc.)
- Commands: All `executeControl*()` methods
- CSS: `src/editor/assets/css/control/*`

**Impact:** Significant code reduction (~5,000+ lines)

---

### 3. Advanced Elements (4 fitur)

| Fitur | Reason |
|-------|--------|
| LaTeX/Math Formula | Tidak dipakai di project |
| Code Block | Tidak dipakai di project |
| Checkbox List | Tidak dipakai di project |
| Area/Section | Tidak dipakai di project |

**Files to remove:**
- `src/editor/core/draw/particle/latex/LaTexParticle.ts`
- `src/editor/core/draw/particle/latex/utils/*`
- `src/editor/core/draw/particle/block/BlockParticle.ts`
- `src/editor/core/draw/interactive/Area.ts`
- Enum: `ElementType.LATEX`, `ElementType.BLOCK`, `ElementType.AREA`
- Commands: `executeInsertLatex()`, `executeInsertCodeBlock()`, etc.

---

## 📊 Impact Analysis

### Code Reduction
| Module | Lines Before | Lines After | Reduction |
|--------|:------------:|:-----------:|:---------:|
| Form Controls | ~5,000 | 0 | 100% |
| LaTeX System | ~1,500 | 0 | 100% |
| Super/Subscript | ~300 | 0 | 100% |
| Code Block | ~800 | 0 | 100% |
| Area System | ~600 | 0 | 100% |
| **TOTAL** | **~8,200** | **0** | **100%** |

### Feature Count
| Metric | Before | After | Change |
|--------|:------:|:-----:|:------:|
| Total Features | 121 | 108 | -13 |
| Core Features | 59 | 57 | -2 |
| Advanced Features | 62 | 51 | -11 |

### Bundle Size (Estimated)
- **Before:** ~450KB (minified)
- **After:** ~380KB (minified)
- **Reduction:** ~70KB (~15.5%)

---

## 🎯 Implementation Roadmap

### Phase 1: Cleanup (Week 1) 🗑️

**Priority:** Remove unused features

**Tasks:**
1. ✅ Remove Form Controls module
2. ✅ Remove LaTeX system
3. ✅ Remove Code Block
4. ✅ Remove Super/Subscript
5. ✅ Remove Area/Section
6. ✅ Update exports in `index.ts`
7. ✅ Remove related CSS files
8. ✅ Run tests to ensure no breaking changes

**Deliverable:** Cleaner, lighter codebase

---

### Phase 2: Cell Padding Control (Week 2) 🎛️

**Priority:** Implement most valuable feature

**Tasks:**
1. ✅ Update `ITableCell` interface
2. ✅ Create `executeTableCellPadding()` command
3. ✅ Update `TableParticle` rendering logic
4. ✅ Add UI controls to toolbar
5. ✅ Update metrics calculation
6. ✅ Add tests for cell padding
7. ✅ Update documentation

**Deliverable:** Cell Padding Control feature ready

---

### Phase 3 (Optional): Multi-Column Layout (Week 3-5) 📰

**Priority:** Complex feature - Consider carefully

**Tasks:**
1. ⏸️ Design column architecture
2. ⏸️ Create Column element types
3. ⏸️ Refactor layout engine
4. ⏸️ Implement column flow calculation
5. ⏸️ Handle page breaks in columns
6. ⏸️ Update cursor positioning
7. ⏸️ Add UI controls
8. ⏸️ Extensive testing
9. ⏸️ Performance optimization

**Deliverable:** Multi-column layout feature (HIGH EFFORT!)

---

## 💡 Final Recommendation

### Option A: Minimal (2 weeks) ⭐ **RECOMMENDED**

```
Week 1: Cleanup (remove 15 features)
Week 2: Cell Padding Control
```

**Pros:**
- ✅ Quick delivery (2 weeks)
- ✅ Immediate value (cleaner code + 1 feature)
- ✅ Low risk
- ✅ Most cost-effective

**Cons:**
- ❌ No multi-column layout (yet)

---

### Option B: Full (4-5 weeks)

```
Week 1: Cleanup (remove 15 features)
Week 2: Cell Padding Control
Week 3-5: Multi-Column Layout
```

**Pros:**
- ✅ Complete feature parity
- ✅ Multi-column layout included

**Cons:**
- ❌ Long timeline (4-5 weeks)
- ❌ High complexity
- ❌ Higher risk
- ❌ Significant effort for 1 feature

---

## 📝 Testing Requirements

### Phase 1: Cleanup
- [ ] All existing tests still pass
- [ ] No breaking changes to public API
- [ ] Bundle size reduced as expected
- [ ] Demo app works without removed features

### Phase 2: Cell Padding
- [ ] Table rendering with custom padding
- [ ] Padding persists in data model
- [ ] Export/import maintains padding
- [ ] UI controls work correctly
- [ ] Metrics calculation is correct

### Phase 3: Multi-Column (if implemented)
- [ ] Column layout rendering
- [ ] Text flow between columns
- [ ] Page breaks in columns
- [ ] Cursor positioning in columns
- [ ] Selection across columns
- [ ] Export/print with columns
- [ ] Performance benchmarks

---

## 📋 Checklist

### Pre-Implementation
- [x] Feature comparison completed
- [x] Migration plan created
- [x] Stakeholder approval
- [ ] Development environment ready
- [ ] Test plan prepared

### Phase 1: Cleanup
- [ ] Backup current codebase
- [ ] Remove Form Controls module
- [ ] Remove LaTeX system
- [ ] Remove other unused features
- [ ] Update exports
- [ ] Remove CSS files
- [ ] Run test suite
- [ ] Verify bundle size reduction
- [ ] Commit changes

### Phase 2: Cell Padding
- [ ] Design interface changes
- [ ] Implement command API
- [ ] Update rendering logic
- [ ] Add UI controls
- [ ] Write tests
- [ ] Update documentation
- [ ] Code review
- [ ] Merge to main

### Phase 3: Multi-Column (Optional)
- [ ] Architecture design review
- [ ] Prototype column layout
- [ ] Implement core functionality
- [ ] Handle edge cases
- [ ] Performance testing
- [ ] Integration testing
- [ ] Documentation
- [ ] Code review
- [ ] Gradual rollout

---

## 🔗 Related Documents

- [FEATURE_COMPARISON.md](./FEATURE_COMPARISON.md) - Detailed feature comparison
- [CLAUDE.md](./CLAUDE.md) - Project architecture guide
- [README.md](./README.md) - Project overview

---

## 📧 Questions & Feedback

For questions about this migration plan, please refer to the project maintainer.

**Last Updated:** 2026-02-05
