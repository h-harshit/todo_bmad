---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-core-experience', 'step-04-emotional-response', 'step-05-wireframes']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md', '_bmad-output/planning-artifacts/epics.md']
---

# UX Design Specification — todo_bmad

**Author:** Harshit
**Date:** 2026-04-29

---

## Executive Summary

### Project Vision

todo_bmad is a personal task management application built on a philosophy of **deliberate restraint**. Rather than adding features, this app removes the complexity that plagues mainstream task tools. It serves a single authenticated user, offering a three-column Kanban board (Todo, In Progress, Done) for managing personal work. The differentiator is simplicity: no collaboration overhead, no notifications, no integrations—just an app that does one thing exceptionally well.

### Target Users

**Primary User:** Solo knowledge worker or developer managing personal tasks.
- Values speed and simplicity over feature richness
- Comfortable with web applications
- Desktop-focused usage during work hours
- Task complexity: simple titles are sufficient (no descriptions or metadata needed)
- **User's immediate need:** See the board first—the board IS the interface

### Key Design Challenges

1. **Board-First UX:** The board must be the primary, immediate view after login. No task detail views, no nested navigation.
2. **Radical Simplicity:** Every UI element must justify its existence. Resist feature creep and design flourishes.
3. **Click-Friendly Interactions:** No drag-and-drop (trackpad friction). Task movement via buttons/dropdowns only.
4. **Visual Clarity with Minimal Elements:** Three columns and task cards must create an immediately obvious layout with no learning curve.
5. **Instant Feedback Without Spinners:** Operations (create, move, edit, delete) must provide seamless visual feedback with zero-delay re-fetch.

### Design Opportunities

1. **Beautifully Sparse Interface:** Removing features enables a strikingly clean board. Lots of whitespace, clear hierarchy, zero clutter.
2. **Obvious, Undeniable Affordances:** Every button and control can be large, clear, and visually obvious. Click-friendly means big targets.
3. **Consistent Interaction Patterns:** Predictable, repeatable patterns for create, edit, and delete across the entire interface.
4. **Fast, Lightweight Design:** Desktop-only + simplicity = optimize for speed and responsiveness. The app should feel instant.

---

## Core User Experience

### Defining Experience

todo_bmad's core experience centers on **viewing and managing a personal task board**. The primary user action is moving tasks between columns to track progress. Creating and editing tasks are secondary but equally important. The experience must feel frictionless—users think in terms of "move this task to Done," not "navigate to dialog, update field, save."

### Platform Strategy

Desktop-only web application. Mouse-click interaction model (no drag-and-drop, no keyboard shortcuts required). The interface is optimized for quick scanning and fast interactions. All operations complete with visual feedback in under 200ms.

### Effortless Interactions

- **Task Movement:** Moving a task to a different column requires 1-2 clicks maximum. Visual feedback is instant.
- **Task Creation:** Adding a new task is a simple inline input in the Todo column. Type, press Enter, done.
- **Auto-Save:** All changes persist automatically without user action or confirmation dialogs.

### Critical Success Moments

- **First Login:** User lands on the board immediately, sees an empty state that clearly indicates "here's where your work goes."
- **First Task Creation:** Adding a task is so simple that users intuitively understand the entire app in seconds.
- **First Task Move:** Moving a task reinforces the core interaction model instantly.

### Experience Principles

1. Board is always visible and primary
2. Task movement is the hero interaction (1-2 clicks, instant feedback)
3. Task creation is equally frictionless
4. Visual minimalism (every element earns its space)
5. Invisible auto-save (no save buttons or confirmations)

---

## Emotional Response & Visual Language

### Desired Emotional Response

**Primary Emotions:** Calm, focused, accomplished

Users should feel **in control and capable**. When moving a task or creating one, they feel accomplished, not confused. The interface is peaceful and uncluttered—no anxiety about what to click or where things are.

### Emotional Journey

- **First Visit:** Land on the board, immediately understand it. Feel calm and oriented (not lost).
- **Creating a Task:** Simple enough to feel effortless. Accomplished before you've started working.
- **Moving a Task:** Instant visual feedback creates control and progress. Accomplish something tangible in seconds.
- **Error/Problem:** Clear message about what happened. Transparency builds trust. No silent failures.

### Design Principles

- **Calm Visual Language:** Generous whitespace, clear typography, minimal color. No visual noise.
- **Accomplishment Through Clarity:** Every action has immediate visual feedback. Users see their work reflected instantly.
- **Transparency in Feedback:** Clear confirmations and error messages.
- **Effortless Simplicity:** Every interaction is obvious. Users feel smart and capable.

---

## Screen Wireframes

### 1. Login Screen

**Layout:** Centered, minimal
**Content:**
```
┌─────────────────────────────────┐
│                                 │
│                                 │
│           todo_bmad             │
│                                 │
│    ┌─────────────────────┐     │
│    │ Email/Username      │     │
│    └─────────────────────┘     │
│                                 │
│    ┌─────────────────────┐     │
│    │ Password            │     │
│    └─────────────────────┘     │
│                                 │
│       ┌──────────────────┐     │
│       │  Log In          │     │
│       └──────────────────┘     │
│                                 │
│  Error message (if invalid)     │
│                                 │
└─────────────────────────────────┘
```

**Specifications:**
- Simple, centered form on desktop
- Focus: get users into the board as fast as possible
- Error message displays inline below password field (red text, clear language)
- "Log In" button is prominent and obvious
- No additional UI elements, no branding beyond the app name
- Light background, minimal styling

---

### 2. Empty Board (First-Time User)

**Layout:** Three columns, full width
**Content:**
```
┌────────────────────────────────────────────────────────────────┐
│  todo_bmad          [+ Create Task]          [Log Out]         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ TODO         │  │ IN PROGRESS  │  │ DONE         │        │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤        │
│  │              │  │              │  │              │        │
│  │ No tasks     │  │ No tasks     │  │ No tasks     │        │
│  │              │  │              │  │              │        │
│  │ ┌──────────┐ │  │              │  │              │        │
│  │ │ + New    │ │  │              │  │              │        │
│  │ └──────────┘ │  │              │  │              │        │
│  │              │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Three equal-width columns
- Header: App name (left), "Create Task" button (center), "Log Out" button (right)
- Each column has a title (TODO, IN PROGRESS, DONE)
- Empty state shows "No tasks" with a "+ New" button in the TODO column only
- Generous whitespace, calm visual layout
- Clear column separation (light borders or background color difference)

---

### 3. Board with Tasks

**Layout:** Three columns with task cards
**Content:**
```
┌────────────────────────────────────────────────────────────────┐
│  todo_bmad          [+ Create Task]          [Log Out]         │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ TODO         │  │ IN PROGRESS  │  │ DONE         │        │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤        │
│  │              │  │              │  │              │        │
│  │ ┌──────────┐ │  │ ┌──────────┐ │  │ ┌──────────┐ │        │
│  │ │ Design   │ │  │ │ Implement│ │  │ │ Research │ │        │
│  │ │ login    │ │  │ │ API      │ │  │ │ tools    │ │        │
│  │ │ [↓]  [⋯] │ │  │ │ [↓]  [⋯] │ │  │ │ [↓]  [⋯] │ │        │
│  │ └──────────┘ │  │ └──────────┘ │  │ └──────────┘ │        │
│  │              │  │              │  │              │        │
│  │ ┌──────────┐ │  │              │  │              │        │
│  │ │ Write    │ │  │              │  │              │        │
│  │ │ tests    │ │  │              │  │              │        │
│  │ │ [↓]  [⋯] │ │  │              │  │              │        │
│  │ └──────────┘ │  │              │  │              │        │
│  │              │  │              │  │              │        │
│  │ ┌──────────┐ │  │              │  │              │        │
│  │ │ + New    │ │  │              │  │              │        │
│  │ └──────────┘ │  │              │  │              │        │
│  │              │  │              │  │              │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

**Specifications:**
- Each task is a clean card with title text
- Card has two icons/buttons on bottom right:
  - **[↓]** Dropdown to move to another column (shows: "Move to In Progress", "Move to Done", etc. — only show columns other than current)
  - **[⋯]** Menu button for edit/delete (shows: "Edit", "Delete")
- "+ New" input appears at bottom of TODO column (or top, designer preference)
- Cards are clickable (clicking title enters edit mode, or can have separate edit button)
- Auto-save: no visible save buttons anywhere
- Generous spacing between cards, lots of whitespace

---

### 4. Task Interactions

#### 4a. Task Card - Move Dropdown

**When user clicks [↓] on a task card:**

```
┌──────────┐
│ Task     │
│ Title    │
│ [↓]  [⋯] │  ← User clicks [↓]
└──────────┘

Dropdown appears:
┌─────────────────────┐
│ Move to In Progress  │
│ Move to Done        │
└─────────────────────┘
```

**Specifications:**
- Click [↓] to reveal dropdown menu
- Shows only other columns (if currently in TODO, shows "Move to In Progress" and "Move to Done")
- Click on option → task moves instantly to that column
- Dropdown closes, card moves with instant visual feedback
- No confirmation dialog

#### 4b. Task Card - Edit/Delete Menu

**When user clicks [⋯] on a task card:**

```
┌──────────┐
│ Task     │
│ Title    │
│ [↓]  [⋯] │  ← User clicks [⋯]
└──────────┘

Menu appears:
┌──────────┐
│ Edit     │
│ Delete   │
└──────────┘
```

**Specifications:**
- Click [⋯] to reveal menu
- "Edit" → Title becomes editable inline (text field, press Enter to save, Esc to cancel)
- "Delete" → Confirmation modal appears: "Delete this task?" with [Confirm] and [Cancel] buttons
- After delete confirmation → Task disappears instantly

#### 4c. Task Title - Edit Mode

**When user clicks "Edit" or directly clicks title:**

```
Before:
┌──────────┐
│ Buy milk │
│ [↓]  [⋯] │
└──────────┘

After click (Edit mode):
┌──────────────────┐
│ [Buy milk...]    │ ← Editable text field, cursor active
│ [↓]  [⋯]         │
└──────────────────┘
```

**Specifications:**
- Title becomes an editable text input
- Text is pre-selected or cursor is positioned
- Press Enter to save (auto-saves in background)
- Press Esc to cancel (reverts to original title)
- Click outside field to save (or Blur = save)
- Empty title validation: if empty, show brief error inline ("Task needs a title")

#### 4d. Create Task - Inline Input

**In the TODO column:**

```
Before:
┌──────────┐
│ [+ New]  │
└──────────┘

After click:
┌──────────────────┐
│ [Type task...]   │ ← Text input, placeholder text, cursor active
└──────────────────┘

After typing and pressing Enter:
┌──────────┐
│ New task │
│ [↓]  [⋯] │
└──────────┘
```

**Specifications:**
- Placeholder text: "Type a task..."
- User types task title
- Press Enter to create → Task card appears instantly below input
- Input clears and stays focused (ready for next task)
- Empty submission validation: if user presses Enter with no text, show brief error ("Task needs a title")
- Tab/click elsewhere saves the task

#### 4e. Delete Confirmation Modal

**When user clicks "Delete":**

```
┌──────────────────────────────┐
│ Delete this task?            │
│                              │
│ "Buy milk"                   │
│                              │
│  [Confirm]      [Cancel]     │
└──────────────────────────────┘
```

**Specifications:**
- Modal appears centered on screen (dims background)
- Shows the task title being deleted
- Two buttons: [Confirm] (red or prominent) and [Cancel] (secondary)
- Confirm → Task deleted instantly, modal closes
- Cancel → Modal closes, task remains
- No "undo" option (deletion is permanent per requirements)

---

## Visual Design Language

### Color Palette

- **Primary Background:** White or very light gray (#FFFFFF or #F8F8F8)
- **Column Backgrounds:** Slightly off-white or light gray (#F5F5F5) to create subtle separation
- **Text:** Dark gray (#333333) or black (#000000)
- **Borders/Dividers:** Light gray (#DDDDDD) — minimal, subtle
- **Button/Card Backgrounds:** Clean white (#FFFFFF) with subtle shadow or border
- **Accent (for delete/destructive actions):** Red (#DC3545) or similar
- **Hover/Active States:** Very subtle background shift or color change (no bold highlights)

**Philosophy:** Minimal color, maximum clarity. The content (tasks) should be prominent, not the interface.

### Typography

- **Font Family:** Clean, sans-serif (system default or simple web font like Inter, Roboto)
- **Header/Title:** Larger, clean (e.g., 24px for "todo_bmad", 16px for column headers)
- **Task Title:** Medium size (14-16px), readable at a glance
- **Labels/Buttons:** Consistent, 14-16px
- **Error Messages:** Small (12px), clear red color

**Philosophy:** Readable, no decorative fonts. Typography should be invisible (users focus on content, not the typeface).

### Spacing & Layout

- **Column Width:** Equal three-column layout (33% each on desktop, minus gutters)
- **Gutters:** 20-30px between columns
- **Card Spacing:** 16px margin between task cards
- **Internal Padding:** 12-16px inside cards and buttons
- **Whitespace:** Generous. Don't crowd the board. Calm aesthetic requires breathing room.

**Philosophy:** Space is part of the design. Whitespace reduces cognitive load.
