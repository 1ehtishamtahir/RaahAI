# RaahAI — Complete UI/UX Design Specification

## 1. Product

**Name:** RaahAI  
**Tagline:** Your Smart Guide to Government Services

RaahAI is a modern AI government-services assistant interface focused on helping citizens understand government procedures, documents, OCR results, voice assistance, and personalized checklists.

---

# 2. Design Concept

The redesigned interface follows a **clean civic-tech / AI assistant aesthetic**.

### Visual Goals

- Trustworthy
- Simple
- Modern
- Friendly
- Government-oriented without looking bureaucratic
- Easy for Urdu and English users
- Strong information hierarchy
- Minimal visual noise

### Main Visual Language

- White application surfaces
- Soft mint/green backgrounds
- Deep government green for primary actions
- Large rounded cards
- Thin borders
- Soft shadows
- Generous whitespace
- Simple line icons
- Subtle Pakistani visual identity

---

# 3. Application Layout

The desktop interface uses a three-zone layout:

```text
┌──────────────────────────────────────────────────────────────┐
│                        TOP HEADER                            │
├───────────────┬────────────────────────────┬─────────────────┤
│               │                            │                 │
│   SIDEBAR     │       CHAT / MAIN          │  RIGHT PANEL    │
│               │       WORKSPACE            │                 │
│               │                            │                 │
│               │                            │  Checklist      │
│               │                            │  Services       │
│               │                            │  OCR Upload     │
└───────────────┴────────────────────────────┴─────────────────┘
```

### Desktop dimensions

Recommended:

- Sidebar: `308px`
- Right panel: `390–420px`
- Main area: flexible
- Page padding: `24px`
- Card spacing: `16–24px`
- Card radius: `16–20px`

---

# 4. Color System

## Primary Palette

| Name | Hex | Usage |
|---|---|---|
| Raah Green | `#087F3E` | Primary buttons, active states |
| Deep Green | `#075C2D` | Logo, headings |
| Mint | `#EAF7EE` | Selected cards/backgrounds |
| Soft Mint | `#F3FAF5` | Large background areas |
| Success | `#159447` | Completed states |
| White | `#FFFFFF` | Cards and main surfaces |

## Neutral Palette

| Name | Hex | Usage |
|---|---|---|
| Text | `#17201B` | Main text |
| Secondary | `#66716B` | Descriptions |
| Muted | `#98A29C` | Placeholder text |
| Border | `#E3E9E5` | Borders |
| Background | `#FBFDFC` | Application background |

## Service Colors

### Passport
`#087F3E`

### CNIC
`#3478E5`

### Business Registration
`#6844C7`

---

# 5. Typography

Recommended:

```css
font-family:
  Inter,
  "Noto Sans",
  "Noto Sans Arabic",
  sans-serif;
```

### Scale

| Element | Size | Weight |
|---|---:|---:|
| Page title | 24–28px | 700 |
| Section title | 18–20px | 650 |
| Card title | 16–18px | 600 |
| Body | 14–16px | 400 |
| Small text | 12–14px | 400 |
| Navigation | 14–15px | 500 |
| Button | 14px | 600 |

Urdu content must support RTL rendering.

---

# 6. Sidebar

The sidebar is a permanent navigation panel on desktop.

## Logo Area

```text
        [RaahAI Logo]

RaahAI
Your Smart Guide to
Government Services
```

Use the RaahAI leaf-style logo as the primary brand mark.

## Navigation

```text
●  Chat Assistant
▣  Document Explainer
⌗  OCR Scanner
♩  Voice Assistant
▣  My Checklist
◷  History
♡  Saved
♧  Notifications
⚙  Settings
?  Help & Support
```

### Active Item

The active item should use:

- Soft mint background
- Green icon
- Dark green text
- Rounded corners
- Small right chevron

Example:

```text
┌─────────────────────────────┐
│ ●  Chat Assistant          › │
└─────────────────────────────┘
```

---

# 7. Sidebar Bottom Section

## Language Selector

Use a segmented selector:

```text
🌐     اردو     |     English
```

The selected language gets a mint pill background.

## User Profile

```text
┌────────────────────────────┐
│  ○  Ehtisham Tahir       ˅ │
│     Free Plan               │
└────────────────────────────┘
```

The profile component should support:

- Account settings
- Plan information
- Logout

---

# 8. Pakistani Visual Identity

The bottom of the sidebar contains a subtle illustration.

Recommended elements:

- Minar-e-Pakistan
- Mosque silhouette
- Crescent/star flag
- Soft green landscape
- Very low visual contrast

The illustration must remain decorative and must not interfere with navigation.

---

# 9. Top Header

The top header sits above the main workspace.

## Greeting

```text
👋  Assalam-o-Alaikum!

    I'm RaahAI, how can I help you today?
```

The greeting should feel personal but professional.

## Header Actions

Right side:

```text
[ 🎙 Voice Mode ]   ☼   🔔   [Avatar]
```

### Voice Mode Button

Primary action:

```text
┌──────────────────┐
│ 🎙  Voice Mode   │
└──────────────────┘
```

Use an outlined green style in the redesigned UI.

---

# 10. Main Chat Workspace

The center area is the primary workspace.

The chat should feel like an AI assistant rather than a traditional messaging application.

---

# 11. User Message

User messages appear toward the right.

Example:

```text
┌──────────────────────────────────────────┐
│ Passport banwane ke liye kya documents  │
│ chahiye aur process kya hai?            │
│                              10:30 AM ✓✓ │
└──────────────────────────────────────────┘
```

### Style

- Very light green background
- Rounded corners
- Dark text
- User avatar on the right
- Compact timestamp

---

# 12. RaahAI Response

AI messages use a larger white card.

```text
┌─────────────────────────────────────────┐
│  [Logo]  RaahAI ✓              10:30 AM │
│                                         │
│  Passport banwane ke liye aapko kuch   │
│  zaroori documents ki zarurat hoti hai. │
│                                         │
│  Required Documents                     │
│                                         │
│  ● Original CNIC / Smart CNIC           │
│  ● B-Form                               │
│  ● Passport photographs                 │
│  ● Previous passport                    │
│  ● Fee payment receipt                  │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Process Summary                         │
│                                         │
│  ① Online form                           │
│  ② Fee payment                           │
│  ③ Appointment                           │
│  ④ Center visit                          │
│  ⑤ Verification                          │
│                                         │
│  Source: [DGIP Official Website ↗]      │
│                                         │
│       ♡     👎     □                     │
└─────────────────────────────────────────┘
```

---

# 13. AI Response Design Principles

AI answers should be:

- Scannable
- Structured
- Short where possible
- Step-based for procedures
- Checklist-based for documents
- Source-backed

Avoid showing huge paragraphs.

Use headings such as:

- Required Documents
- Process
- Fees
- Eligibility
- Important Notes
- Source

---

# 14. Source Citation

Every important government-information answer should provide a visible source.

Example:

```text
Source:
[ DGIP Official Website ↗ ]
```

The source should look like a small green pill.

Do not make the source visually dominant.

---

# 15. Chat Input

The input is fixed near the bottom of the main workspace.

```text
┌────────────────────────────────────────────────────────┐
│ 📎  Type your question in Urdu or English...    🎙  ➤ │
└────────────────────────────────────────────────────────┘
```

### Controls

- Attachment
- Text input
- Microphone
- Send

### Send Button

Circular green button with a white send icon.

---

# 16. Safety / Accuracy Notice

Below the input:

```text
◇ RaahAI can make mistakes. Please verify important information.
```

Use subtle gray text.

---

# 17. Right Panel

The right panel contains three major widgets:

1. Document Checklist
2. Popular Services
3. OCR Upload

---

# 18. Document Checklist Card

## Header

```text
📋  Your Document Checklist              View All
```

## Current Process

```text
Passport (New)                 In Progress
```

## Checklist

```text
☑ Original CNIC / Smart CNIC
☑ B-Form (if under 18)
☑ Photographs
☐ Previous Passport (if any)
☐ Fee Payment
```

## Progress

```text
████████████░░░░░

3 / 5 Completed
```

The progress bar uses the RaahAI green.

---

# 19. Popular Services Card

## Header

```text
Popular Services                    View All
```

## Service Item

### Passport

```text
[Passport Icon]  Passport                    ›
                 Apply for new passport
                 or renewal
```

### CNIC

```text
[CNIC Icon]      CNIC                         ›
                 Apply for new CNIC or
                 update information
```

### Business Registration

```text
[Briefcase]      Business Registration        ›
                 Register your business
                 with SECP
```

Each item should be clickable.

---

# 20. OCR Upload Card

The bottom-right widget promotes document scanning.

```text
┌─────────────────────────────────────────┐
│ Need to scan a form?                    │
│                                         │
│ Upload your document and let RaahAI     │
│ extract & explain it for you.           │
│                                         │
│ [ ↑ Upload Document ]      [Document]   │
└─────────────────────────────────────────┘
```

Use a subtle mint gradient.

---

# 21. OCR Flow

```text
Upload
   ↓
Document Detection
   ↓
OCR Extraction
   ↓
Field Recognition
   ↓
AI Explanation
   ↓
Checklist / Guidance
```

---

# 22. Document Explainer Screen

The document explainer should use a split layout.

```text
┌───────────────────────────┬───────────────────────────┐
│                           │                           │
│     DOCUMENT PREVIEW      │      EXTRACTED DATA       │
│                           │                           │
│      [Government Form]    │ Name: __________          │
│                           │ CNIC: __________          │
│                           │ DOB: __________           │
│                           │ Address: _________       │
│                           │                           │
└───────────────────────────┴───────────────────────────┘
```

Clicking a field opens an AI explanation.

---

# 23. Voice Assistant Screen

The voice experience should be intentionally simple.

```text
                    RaahAI Voice

                       ◉

                  Listening...

          "Passport renew karwana hai"

                     [Stop]
```

### Processing

```text
Voice
 ↓
Whisper
 ↓
Language Understanding
 ↓
RAG
 ↓
Qwen
 ↓
Answer
 ↓
Text-to-Speech
```

---

# 24. Language Support

Support:

- English
- Urdu

### English

```text
What documents do I need?
```

### Urdu / Roman Urdu

```text
Mujhe passport renew karwana hai.
```

### RTL Urdu

```text
مجھے پاسپورٹ کے لیے مطلوبہ دستاویزات بتائیں۔
```

When using native Urdu, the content container should support:

```css
direction: rtl;
text-align: right;
```

---

# 25. Mobile Design

On mobile, remove the permanent sidebar.

Use:

```text
┌─────────────────────────────┐
│ RaahAI              🔔  ☰   │
├─────────────────────────────┤
│                             │
│         Chat Area           │
│                             │
│                             │
├─────────────────────────────┤
│ Type your question...   ➤  │
├─────────────────────────────┤
│ Chat | Scan | Voice | More │
└─────────────────────────────┘
```

Right-side cards become separate screens or bottom sheets.

---

# 26. Responsive Breakpoints

Recommended:

```text
Mobile:      < 768px
Tablet:      768–1199px
Desktop:     ≥ 1200px
Large:       ≥ 1440px
```

### Desktop

```text
Sidebar + Chat + Right Panel
```

### Tablet

```text
Sidebar + Main
```

Right panel becomes collapsible.

### Mobile

```text
Header + Main + Bottom Navigation
```

---

# 27. UI Components

Create reusable components:

```text
AppShell
Sidebar
TopHeader
NavigationItem
LanguageSelector
ProfileMenu

ChatWindow
UserMessage
AIMessage
SourceBadge
ChatInput

ChecklistCard
ChecklistItem
ProgressBar

ServiceCard
ServiceIcon

UploadCard
DocumentUploader
DocumentPreview
OCRField
OCRResult

VoiceMode
VoiceVisualizer

NotificationMenu
SettingsPanel
```

---

# 28. Interaction States

Every interactive component needs:

### Default
Normal state.

### Hover
Small elevation/background change.

### Active
Green highlight.

### Loading
Skeleton or contextual progress.

### Success
Green success state.

### Error
Clear error message and retry action.

Example:

```text
Unable to process this document.

[ Try Again ]
```

---

# 29. AI Loading States

Use contextual messages rather than a generic spinner.

### Chat

```text
RaahAI is searching official information...
```

Then:

```text
RaahAI is preparing your answer...
```

### OCR

```text
Reading your document...
```

Then:

```text
Understanding form fields...
```

---

# 30. Accessibility

The interface should provide:

- Keyboard navigation
- Visible focus states
- Accessible labels
- Sufficient contrast
- Large touch targets
- Screen-reader-friendly controls
- Urdu RTL support
- Color-independent status indicators

---

# 31. Recommended Frontend Structure

```text
app/
├── dashboard/
│   ├── page.tsx
│   ├── chat/
│   ├── documents/
│   ├── ocr/
│   ├── voice/
│   ├── checklist/
│   ├── history/
│   ├── notifications/
│   └── settings/
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx
│   │   ├── Sidebar.tsx
│   │   └── TopHeader.tsx
│   │
│   ├── chat/
│   │   ├── ChatWindow.tsx
│   │   ├── UserMessage.tsx
│   │   ├── AIMessage.tsx
│   │   └── ChatInput.tsx
│   │
│   ├── services/
│   │   ├── ServiceCard.tsx
│   │   └── ServiceIcon.tsx
│   │
│   ├── checklist/
│   │   ├── ChecklistCard.tsx
│   │   └── ChecklistItem.tsx
│   │
│   └── documents/
│       ├── UploadCard.tsx
│       ├── DocumentPreview.tsx
│       └── OCRField.tsx
│
└── styles/
    └── globals.css
```

---

# 32. Core Design Rule

The interface should always answer three questions quickly:

```text
1. What does the user need?

2. What should they do next?

3. Where did this information come from?
```

RaahAI should feel less like a generic chatbot and more like a **personal government-process navigator**.

---

# 33. MVP Screens

The redesigned MVP should include:

1. Dashboard / Chat
2. Service Selection
3. Document Checklist
4. Document Upload
5. OCR Scanner
6. OCR Results
7. Document Explainer
8. Voice Assistant
9. History
10. Notifications
11. Settings

Initial service categories:

- Passport
- CNIC
- Business Registration

---

# 34. Design Summary

```text
RaahAI
│
├── Ask
│   ├── Text
│   ├── Urdu
│   ├── English
│   └── Voice
│
├── Understand
│   ├── AI
│   ├── RAG
│   └── OCR
│
├── Guide
│   ├── Steps
│   ├── Documents
│   └── Personalized Checklist
│
└── Trust
    ├── Official Sources
    ├── Citations
    └── Accuracy Notice
```

**Design principle:**

> Make the government process understandable without making the citizen understand the government system.
