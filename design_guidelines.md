# Lorry Receipt Management System - Design Guidelines

## Design Approach

**Selected System:** Material Design-inspired approach
**Rationale:** Utility-focused enterprise application requiring structured data entry, clear form organization, and professional presentation of transport documents. Material Design provides excellent patterns for form-heavy interfaces and data visualization.

## Typography System

**Font Family:** Inter (primary), Roboto Mono (LR numbers, codes)

**Hierarchy:**
- Page Titles: text-3xl font-semibold (36px)
- Section Headers: text-xl font-medium (20px)
- Form Labels: text-sm font-medium (14px)
- Body Text: text-base (16px)
- Helper Text: text-sm text-gray-600 (14px)
- LR Numbers/Codes: font-mono text-base

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, and 12
- Form field spacing: space-y-6
- Section padding: p-6 or p-8
- Card margins: m-4
- Input padding: p-3

**Container Strategy:**
- Main content: max-w-7xl mx-auto
- Form sections: max-w-4xl
- Receipt view: max-w-3xl (optimized for print)

## Component Library

### Navigation
- **Top Navigation Bar:** Full-width with app logo/name, primary actions ("New LR" button), user menu
- **Sidebar Navigation:** Fixed left sidebar with icons + labels for Dashboard, All LRs, Reports, Settings

### Forms & Data Entry
- **Multi-Section Forms:** Group related fields (Consignor Details, Consignee Details, Vehicle Info, Goods Details, Charges)
- **Input Fields:** Bordered inputs with floating labels, clear focus states, inline validation messages
- **Grid Layouts:** Two-column grids for form fields (name + GSTIN, city + state)
- **Add/Remove Rows:** For multiple goods entries with clear + and × buttons

### Data Display
- **LR List View:** Table with columns: LR Number, Date, Consignor, Consignee, Vehicle No., Status, Actions
- **Receipt View:** Card-based layout mimicking physical lorry receipt with clear sections and border separators
- **Summary Cards:** Dashboard widgets showing total LRs, pending deliveries, revenue stats

### Buttons & Actions
- **Primary CTA:** Solid buttons for "Create LR", "Save", "Print"
- **Secondary Actions:** Outlined buttons for "Cancel", "Edit"
- **Icon Buttons:** For row actions (view, edit, delete) in tables

### Status & Feedback
- **Status Badges:** Pill-shaped badges for "In Transit", "Delivered", "Pending" with semantic meaning
- **Toast Notifications:** Top-right positioned for success/error feedback
- **Loading States:** Skeleton loaders for table rows and form sections

## Key Design Patterns

**Dashboard Layout:** 3-column stats grid above recent LRs table
**Form Layout:** Single-page stepped sections with clear visual separation, progress indicator at top
**Receipt Layout:** Professional document format with header (company details), bordered sections, signature blocks at bottom, optimized for A4 printing
**List/Table Views:** Sticky header, alternating row backgrounds, pagination at bottom, search/filter controls at top

## Icons
Use Material Icons via CDN for consistency with navigation, form fields, and action buttons

## Critical Specifications
- All forms must support tab navigation for efficient data entry
- Receipt view must be print-optimized with @media print styles
- Forms auto-save drafts to prevent data loss
- Clear visual hierarchy in receipt view matching standard LR format (consignor top-left, consignee top-right, goods table center, charges bottom)