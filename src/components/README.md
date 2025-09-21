# Chapman Component System

## Overview

The Chapman mobile app now features a comprehensive, organized component system with design tokens, reusable patterns, and consistent styling.

## Component Organization

### 📁 Folder Structure

```
src/components/
├── cards/          # Card components (BaseCard, Card, CarCard, etc.)
├── forms/          # Form components (FormInput, FormPicker, etc.)
├── modals/         # Modal components (BaseModal, FormModal, etc.)
├── overlays/       # Overlay components (Badge, UserBadge, etc.)
├── ui/             # Basic UI components (Button, LoadingIndicator, etc.)
└── common/         # Re-exports and shared utilities
```

### 🎨 Design Tokens

Access design tokens from `constants/tokens.js`:

```javascript
import { designTokens } from '../constants/tokens';

// Colors
designTokens.colors.BRG
designTokens.colors.SUCCESS

// Spacing
designTokens.spacing.sm  // 8px
designTokens.spacing.md  // 12px
designTokens.spacing.lg  // 16px

// Typography
designTokens.typography.fontSize.md
designTokens.typography.fontWeight.semibold
```

### 🛠 Style Utilities

Use helper functions from `utils/styleUtils.js`:

```javascript
import { createComponentStyles, createTextStyle, spacing } from '../utils/styleUtils';

// Create component styles
const buttonStyles = createComponentStyles('button', 'large');

// Create text styles
const textStyle = createTextStyle({
  size: 'lg',
  weight: 'bold',
  color: 'primary'
});

// Apply spacing
const spacingStyle = spacing('md', 'lg'); // top/bottom: 12px, left/right: 16px
```

## Component Usage

### 🔘 Buttons

#### Variant Button (Recommended)
```javascript
import { VariantButton } from '../components/ui';

<VariantButton
  variant="primary"     // primary, secondary, outline, ghost, danger
  size="medium"         // small, medium, large
  icon="plus"
  iconPosition="left"
  onPress={handlePress}
  fullWidth
>
  Submit
</VariantButton>
```

### 🎴 Cards

#### Variant Card System
```javascript
import { VariantCard, VariantBaseCard } from '../components/cards';

// Simple card
<VariantCard
  variant="elevated"    // default, elevated, outlined, filled, dark, accent
  size="medium"         // compact, medium, large
  elevation="medium"    // none, low, medium, high
>
  <Text>Card content</Text>
</VariantCard>

// Card with BaseCard features
<VariantBaseCard
  variant="dark"
  imageSource={imageUrl}
  title="Card Title"
  onPress={handlePress}
/>
```

### 🏷 Badges

#### Variant Badge System
```javascript
import { VariantBadge, StatusBadge, PriorityBadge } from '../components/overlays';

// Basic badge
<VariantBadge
  variant="primary"     // default, primary, secondary, success, warning, danger
  size="medium"         // small, medium, large
>
  New
</VariantBadge>

// Specialized badges
<StatusBadge status="active" />
<PriorityBadge priority="high" />
```

### 📝 Modals

#### Specialized Modal Components
```javascript
import { FormModal, ConfirmationModal, MediaModal } from '../components/modals';

// Form modal with validation
<FormModal
  visible={isVisible}
  title="Add New Item"
  onSubmit={handleSubmit}
  onClose={handleClose}
  submitButtonText="Save"
  validationError={error}
  loading={loading}
>
  <FormInput label="Name" value={name} onChangeText={setName} />
</FormModal>

// Confirmation modal
<ConfirmationModal
  visible={showConfirm}
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  onConfirm={handleDelete}
  onClose={() => setShowConfirm(false)}
  danger
/>

// Media gallery modal
<MediaModal
  visible={showGallery}
  images={images}
  initialIndex={0}
  onClose={() => setShowGallery(false)}
  showShare
  onShare={handleShare}
/>
```

### 📝 Forms

#### Consistent Form Components
```javascript
import { FormInput, FormPicker, FormSwitch } from '../components/forms';

<FormInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  placeholder="Enter your email"
  required
  error={emailError}
/>

<FormPicker
  label="Category"
  value={category}
  onValueChange={setCategory}
  items={categoryOptions}
  required
/>
```

## Custom Hooks

### 🎣 Available Hooks

```javascript
import {
  useCardData,
  useImageHandler,
  useModalState,
  useApiState,
  usePaginatedApiState
} from '../hooks';

// Process card data
const cardData = useCardData(post, 'post');

// Handle images
const { primary, gallery, hasPrimary } = useImageHandler(post.gallery);

// Manage modal state
const {
  isVisible,
  showModal,
  hideModal,
  loading,
  handleSubmit
} = useModalState();

// API state management
const {
  data,
  loading,
  error,
  execute
} = useApiState();

// Paginated data
const {
  items,
  hasMore,
  loadMore,
  refresh
} = usePaginatedApiState();
```

## Best Practices

### ✅ Do's

1. **Use variant components** for consistent styling
2. **Import from organized folders** (`../components/ui`, `../components/cards`)
3. **Use design tokens** instead of hard-coded values
4. **Leverage custom hooks** for common patterns
5. **Use style utilities** for consistent spacing and typography

### ❌ Don'ts

1. **Don't hard-code colors or spacing** - use design tokens
2. **Don't create new components** without checking existing variants
3. **Don't duplicate logic** - use custom hooks
4. **Don't mix old and new patterns** - migrate to variant system

### 🔄 Migration Guide

#### Old Pattern
```javascript
import Card from '../components/Card';
import Button from '../components/Button';

<Button
  title="Submit"
  variant="primary"
  style={{ backgroundColor: '#1C3738' }}
/>
```

#### New Pattern
```javascript
import { VariantButton } from '../components/ui';

<VariantButton
  variant="primary"
  size="medium"
>
  Submit
</VariantButton>
```

## Performance Benefits

- **Reduced bundle size**: Shared styles and utilities
- **Consistent rendering**: Standardized component patterns
- **Better maintainability**: Centralized design tokens
- **Improved developer experience**: Clear component hierarchy

## Future Enhancements

- **Theme switching**: Light/dark mode support
- **Animation variants**: Consistent motion design
- **Accessibility improvements**: Better ARIA support
- **Responsive design**: Breakpoint-aware components