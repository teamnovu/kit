# DEPRECATED

# Vue Forms Library - MVP Plan

## Overview

A type-safe Vue 3 form library with immutable state management, validation, and subform support. The library uses a direct form instance pattern (no provide/inject) to maintain full type safety throughout the component tree.

## Core Architecture

### Direct Form Instance Pattern
- Forms are created with `createForm<T>()` and passed directly to components
- Full TypeScript type safety maintained throughout the component tree
- No context loss from provide/inject patterns

### Subform Extraction Pattern
```typescript
// Reusable components work with subforms
const addressSubform = form.getSubform('address')
// addressSubform has type FormInstance<Address>

<AddressForm :form="addressSubform" />
```

This allows components to be reusable across different parent forms while maintaining type safety.

## API Design

### Form Creation
```typescript
const form = createForm<UserData>({
  initialData: { name: '', email: '', address: { street: '', city: '' } },
  validationSchema: userSchema,
  strategy: 'onTouch'
})
```

### Form Instance Interface
```typescript
interface FormInstance<T> {
  // Data access
  getValue<K extends keyof T>(path: K): T[K]
  setValue<K extends keyof T>(path: K, value: T[K]): void
  
  // Field management
  getField<K extends keyof T>(path: K): FieldInstance<T[K]>
  
  // Subform extraction
  getSubform<K extends keyof T>(path: K): FormInstance<T[K]>
  
  // State queries
  isDirty(): boolean
  isTouched(): boolean
  isValid(): boolean
  
  // Operations
  validate(): Promise<ValidationResult>
  reset(): void
  submit(): Promise<void>
  
  // Error access
  getErrors(path?: keyof T): ErrorMessage[]
  hasErrors(path?: keyof T): boolean
}
```

### Field Instance Interface
```typescript
interface FieldInstance<T> {
  // Reactive value with getter/setter
  value: Ref<T>
  
  // State
  touched: Ref<boolean>
  dirty: Ref<boolean>
  errors: Ref<ErrorMessage[]>
  
  // Handlers
  onBlur(): void
  onFocus(): void
  
  // Field-specific validation
  validate(): Promise<ValidationResult>
}
```

## Directory Structure

```
src/
├── types/
│   ├── form.ts              # Form instance types
│   ├── field.ts             # Field instance types
│   ├── validation.ts        # Validation types
│   └── index.ts
├── core/
│   ├── form-instance.ts     # Form instance implementation
│   ├── field-instance.ts    # Field instance implementation
│   ├── subform-instance.ts  # Subform implementation
│   └── validation-engine.ts # Validation logic
├── factories/
│   └── create-form.ts       # Main form factory
├── utils/
│   ├── immutable.ts         # Immutable helpers
│   ├── path.ts              # Object path utilities
│   └── type-helpers.ts      # TypeScript utility types
└── index.ts                 # Main exports
```

## Core Features

### 1. Immutable State Management
- Store initial data as immutable
- Working copy is immutable from outside (readonly)
- Computed getter/setter on working copy
- Full clone on creation

### 2. Form State Tracking
- **Touched**: Field has been interacted with at least once
- **Dirty**: Computed property checking if value ≠ initial state
- State propagation from subforms to parent forms

### 3. Validation System
- **Strategies**: `onTouch`, `onFormOpen`, `none`, `preSubmit`
- **Zod Integration**: Primary validation with Zod schemas
- **Backend Validation**: API errors merged with Zod errors
- **Error Bag Structure**:
  ```typescript
  {
    general: ErrorMessage[],
    propertyErrors: Record<string, ErrorMessage[]>
  }
  ```

### 4. Subform Support
- Extract subforms with `getSubform(path)`
- Type-safe subform instances
- Automatic value propagation from subforms to parent
- Reusable components across different parent forms

### 5. Array Functionality (Future)
- `pushValue()`, `removeValue()`, `getKeys()`
- Similar to vee-validate's field array API

## MVP Implementation Order

### Phase 1: Core Infrastructure
1. **Project Setup**
   - Package.json with proper exports
   - TypeScript configuration
   - Vite build setup
   - Basic documentation structure

2. **Type System**
   - Core interfaces and types
   - Validation types
   - Error handling types

3. **Basic Form Instance**
   - Form creation factory
   - Basic field management
   - Immutable state handling

### Phase 2: Essential Features
1. **Field Management**
   - Field instance implementation
   - Touch and dirty state tracking
   - Basic event handlers

2. **Validation Engine**
   - Zod integration
   - Error collection and formatting
   - Basic validation strategies

3. **Subform System**
   - Subform extraction
   - Type-safe subform instances
   - Value propagation

### Phase 3: Polish & Testing
1. **Edge Cases**
   - Error handling
   - Reset functionality
   - Validation edge cases

2. **Documentation**
   - API documentation
   - Usage examples
   - Migration guides

3. **Testing**
   - Unit tests
   - Integration tests
   - Type safety tests

## Key Benefits

- **Type Safety**: Full TypeScript support with no type loss
- **Immutable State**: Predictable state management
- **Reusable Components**: Subforms enable component reuse
- **Validation Flexibility**: Multiple validation strategies
- **Performance**: Reactive updates only where needed
- **Developer Experience**: Excellent IDE support and debugging

## Notes

- No provide/inject pattern to avoid type information loss
- Direct form instance passing maintains type safety
- Subform extraction enables component reusability
- Validation strategies can be overridden per field
- Backend validation seamlessly integrates with Zod
