# MOMENTEE — Couple Page UI/UX Overhaul Plan

> **Goal:** Transform generic couple pages into jaw-dropping, highly personalized micro-sites that users WANT to share on Instagram Stories and TikTok.

---

## PROBLEM ANALYSIS

Current issues with the couple page:
- Looks like every other wedding template site (The Knot, Zola...)
- No personality — every page looks identical except content
- Static feel — no "wow" moments when scrolling
- Limited customization — users can't express their unique style
- Not share-worthy — nothing makes someone screenshot for their story
- Sections feel disconnected — no visual flow or narrative arc
- Mobile experience is an afterthought
- Typography is safe and boring
- Color usage is flat and predictable

---

## DESIGN PHILOSOPHY

**Every couple page should feel like it was designed by a professional for THAT specific couple.**

Core principles:
1. **Theme ≠ just colors.** A theme changes layout, typography, animations, textures, and mood
2. **Motion tells the story.** Scroll = turning pages of a love story
3. **Details create delight.** Micro-interactions, Easter eggs, parallax, cursor effects
4. **Share-worthy by default.** Every section should look like a poster when screenshotted
5. **Customization without overwhelm.** Smart defaults with depth for power users

---

## PART 1: THEME ENGINE — 12+ DISTINCTIVE THEMES

Each theme is NOT just a color swap. Each theme changes:
- Color palette (primary, secondary, accent, background, text)
- Typography pairing (display font + body font)
- Layout style (section arrangements, spacings, grid patterns)
- Background textures/effects (grain, patterns, gradients, particles)
- Animation style (smooth vs bouncy vs dramatic vs subtle)
- Border radius (sharp vs soft vs pill)
- Card styles (glassmorphism, neumorphism, flat, outlined, floating)
- Section dividers (waves, diagonal, curved, straight, none)
- Cursor effects (sparkles, trail, glow, none)
- Scroll effects (parallax intensity, reveal direction, stagger timing)

### Theme Presets

```
THEME 01: "Sunset Coral" (default)
├── Vibe: Warm, romantic, dreamy
├── Colors: #FF6B6B → #FF8E53 → #FFC371 gradient
├── Fonts: Outfit (display) + Sora (body)
├── Background: Warm cream (#FFF8F5) with soft grain texture
├── Cards: Soft white with subtle shadow, 20px radius
├── Dividers: Gentle wave SVG between sections
├── Animation: Smooth ease-out, fade-up reveals
├── Particles: Floating hearts + sparkles
└── Mood: Like golden hour light on skin

THEME 02: "Ocean Breeze"
├── Vibe: Fresh, calm, coastal
├── Colors: #0EA5E9 → #06B6D4 → #67E8F9
├── Fonts: DM Serif Display (display) + DM Sans (body)
├── Background: Cool white (#F0F9FF) with subtle wave pattern
├── Cards: Frosted glass (backdrop-blur + white/10%)
├── Dividers: Ocean wave animation (CSS keyframes)
├── Animation: Flowing, wave-like parallax
├── Particles: Floating bubbles + water drops
└── Mood: Morning beach walk, feet in the sand

THEME 03: "Midnight Garden"
├── Vibe: Elegant, mysterious, luxurious
├── Colors: #1a1a2e base, #E879F9 → #A78BFA → #7C3AED accents
├── Fonts: Playfair Display (display) + Poppins (body)
├── Background: Deep navy (#0F0F23) with star particles
├── Cards: Dark glass (dark/30% + white border/5%)
├── Dividers: Diagonal slashes with gradient lines
├── Animation: Dramatic — scale + rotate + fade
├── Particles: Fireflies / twinkling stars
└── Mood: Candlelit dinner under the stars

THEME 04: "Retro Film"
├── Vibe: Nostalgic, warm, analog
├── Colors: #D97706 → #B45309, muted earth tones
├── Fonts: Libre Baskerville (display) + Source Sans 3 (body)
├── Background: Aged paper (#FAF3E8) with film grain overlay
├── Cards: Polaroid-style (white border, slight rotation, tape effect)
├── Dividers: Film strip frames between sections
├── Animation: Fade-in like developing photos, slight vignette
├── Particles: Film dust / light leaks
└── Mood: Flipping through a vintage photo album

THEME 05: "Cherry Blossom"
├── Vibe: Soft, Japanese-inspired, poetic
├── Colors: #FB7185 → #FDA4AF → #FFF1F2
├── Fonts: Noto Serif JP + Quicksand (body)
├── Background: Soft pink (#FFF5F7) with watercolor bleed textures
├── Cards: Paper-like, no shadow, thin pink border
├── Dividers: Branch illustrations between sections
├── Animation: Petals falling (CSS animation), gentle sway
├── Particles: Sakura petals drifting across screen
└── Mood: Spring morning in Kyoto

THEME 06: "Neon Love"
├── Vibe: Bold, Gen-Z, TikTok energy
├── Colors: #F43F5E neon pink, #8B5CF6 purple, #06B6D4 cyan on dark
├── Fonts: Unbounded (display) + Inter Tight (body)
├── Background: Near-black (#0A0A0F) with gradient mesh blobs
├── Cards: Neon-bordered glass (colored border + dark glass)
├── Dividers: Glitch-style horizontal bars
├── Animation: Bouncy spring physics, glitch reveals
├── Particles: Floating neon geometric shapes (triangles, circles)
└── Mood: Late night city lights, arcade vibes

THEME 07: "Forest Romance"
├── Vibe: Natural, earthy, organic
├── Colors: #166534 → #15803D → #86EFAC
├── Fonts: Fraunces (display) + Atkinson Hyperlegible (body)
├── Background: Warm ivory (#FEFCE8) with botanical line art pattern
├── Cards: Earthy, slightly textured, leaf shadow accents
├── Dividers: Vine/leaf illustrated borders
├── Animation: Growing/blooming reveals (scale from center)
├── Particles: Floating leaves, small butterflies
└── Mood: Enchanted forest wedding

THEME 08: "Minimal Luxe"
├── Vibe: Clean, high-end, editorial
├── Colors: #1C1917 text, #D6D3D1 accents, gold #B8860B highlights
├── Fonts: Cormorant Garamond (display) + Jost (body)
├── Background: Pure white (#FFFFFF) generous whitespace
├── Cards: No background, just content with thin borders
├── Dividers: Simple thin gold lines
├── Animation: Ultra-subtle — opacity only, 0.8s duration
├── Particles: None — clean space
└── Mood: Vogue magazine editorial spread

THEME 09: "Groovy Y2K"
├── Vibe: Fun, playful, nostalgic 2000s
├── Colors: #E879F9 hot pink, #34D399 lime, #FBBF24 yellow, #60A5FA blue
├── Fonts: Bungee Shade (display) + Rubik (body)
├── Background: Lavender (#F3E8FF) with checkerboard/star patterns
├── Cards: Bubbly — thick colorful borders, big radius (28px)
├── Dividers: Squiggly hand-drawn lines
├── Animation: Bouncy spring, wobbly hover effects
├── Particles: Stars, hearts, smiley faces floating
└── Mood: MySpace meets modern, chaotic good energy

THEME 10: "Boho Dreamcatcher"
├── Vibe: Free-spirited, warm, handmade feel
├── Colors: #C2410C terracotta, #D97706 amber, #78716C stone
├── Fonts: Amatic SC (display) + Nunito (body)
├── Background: Warm linen (#FDF4E7) with subtle mandala patterns
├── Cards: Hand-drawn border effect (irregular edges via SVG)
├── Dividers: Macramé-inspired geometric dividers
├── Animation: Gentle swaying, dreamcatcher spin
├── Particles: Feathers, sun rays
└── Mood: Desert sunset, bohemian festival

THEME 11: "K-Drama Romance"
├── Vibe: Sweet, cinematic, K-drama aesthetic
├── Colors: #F472B6 soft pink, #E9D5FF lavender, #FDF2F8 blush
├── Fonts: Gowun Batang (display) + Nanum Gothic (body)
├── Background: Soft gradient pink → lavender with lens flare effects
├── Cards: Soft rounded, pastel glass with pink tint
├── Dividers: Cloud-like curved sections
├── Animation: Slow cinematic zoom, sparkle bursts on scroll
├── Particles: Heart-shaped bokeh, sparkles
└── Mood: K-drama confession scene, butterflies in stomach

THEME 12: "Art Deco Gold"
├── Vibe: Gatsby-era glamour, timeless elegance
├── Colors: #1C1917 black, #B8860B gold, #F5F0E8 cream
├── Fonts: Poiret One (display) + Raleway (body)
├── Background: Dark charcoal (#1C1917) with gold geometric line patterns
├── Cards: Gold-bordered on dark, art deco corner ornaments
├── Dividers: Geometric art deco fan patterns
├── Animation: Elegant sliding reveals, gold shimmer effect
├── Particles: Gold dust / confetti
└── Mood: Roaring twenties ballroom
```

### Theme Implementation

```typescript
// Theme config structure
interface CoupleTheme {
  id: string;
  name: string;
  category: 'warm' | 'cool' | 'dark' | 'playful' | 'elegant';
  isPremium: boolean;

  colors: {
    primary: string;       // main brand color
    secondary: string;     // supporting color
    accent: string;        // highlight/CTA color
    background: string;    // page background
    surface: string;       // card/section background
    text: string;          // primary text
    textMuted: string;     // secondary text
    border: string;        // borders
    gradient: string;      // CSS gradient string
  };

  typography: {
    displayFont: string;   // Google Font name for headings
    bodyFont: string;      // Google Font name for body
    headingWeight: number;
    bodyWeight: number;
    headingStyle: 'normal' | 'italic';
    letterSpacing: string; // tight, normal, wide
  };

  layout: {
    borderRadius: number;  // 0 | 8 | 16 | 24 | 9999
    cardStyle: 'flat' | 'elevated' | 'glass' | 'outlined' | 'neon' | 'paper';
    sectionSpacing: number;
    contentWidth: 'narrow' | 'standard' | 'wide' | 'full';
    heroStyle: 'centered' | 'split' | 'fullscreen' | 'minimal' | 'cinematic';
    timelineStyle: 'alternating' | 'left' | 'centered' | 'zigzag' | 'horizontal';
    galleryStyle: 'masonry' | 'polaroid' | 'grid' | 'carousel' | 'filmstrip';
  };

  effects: {
    backgroundTexture: 'none' | 'grain' | 'dots' | 'lines' | 'paper' | 'geometric' | 'mesh';
    sectionDivider: 'none' | 'wave' | 'diagonal' | 'curve' | 'zigzag' | 'clouds';
    cursorEffect: 'none' | 'sparkles' | 'hearts' | 'trail' | 'glow';
    particles: 'none' | 'hearts' | 'petals' | 'stars' | 'bubbles' | 'fireflies' | 'confetti' | 'snow' | 'leaves';
    scrollAnimation: 'fade-up' | 'fade-in' | 'slide-left' | 'slide-right' | 'scale' | 'rotate' | 'blur-in';
    parallaxIntensity: 0 | 1 | 2 | 3;  // 0=none, 3=dramatic
    hoverEffect: 'lift' | 'glow' | 'tilt' | 'scale' | 'shake' | 'none';
  };
}
```

---

## PART 2: HERO SECTION — 5 LAYOUT OPTIONS

The hero is the FIRST impression. It must be unforgettable.

### Hero Layout A: "Cinematic Fullscreen"
```
┌─────────────────────────────────────────┐
│  [Full viewport background image/video] │
│                                         │
│        ┌─────────────────────┐          │
│        │   Photo    Photo    │          │
│        │   ┌──┐  ♥  ┌──┐    │          │
│        │   │🤵│     │👰│    │          │
│        │   └──┘     └──┘    │          │
│        │                     │          │
│        │  Minh  &  Hương     │          │
│        │                     │          │
│        │  "Our love quote"   │          │
│        │                     │          │
│        │  ┌──┬──┬──┬──┐     │          │
│        │  │DD│HH│MM│SS│     │          │
│        │  └──┴──┴──┴──┘     │          │
│        │                     │          │
│        │  20 · 12 · 2026     │          │
│        └─────────────────────┘          │
│                                         │
│            ↓ scroll                     │
└─────────────────────────────────────────┘
Features:
- Background: couple's photo with Ken Burns slow zoom effect
  OR gradient with animated mesh blobs
  OR looping video (premium)
- Glassmorphism overlay for text readability
- Parallax scroll effect (image moves slower than text)
- Typing animation for the love quote
- Countdown numbers flip/slide animation
- Mouse sparkle trail effect across entire hero
- "Save the date" button with pulse animation
```

### Hero Layout B: "Split Screen"
```
┌──────────────────┬──────────────────────┐
│                  │                      │
│   Partner 1      │     Partner 2        │
│   Photo          │     Photo            │
│   (left half)    │     (right half)     │
│                  │                      │
│                  │                      │
│        ┌─────────┴──────────┐           │
│        │  Minh & Hương      │           │
│        │  countdown + date  │           │
│        └────────────────────┘           │
│                                         │
└─────────────────────────────────────────┘
Features:
- Two separate photo areas for each partner
- Photos have subtle parallax (move in opposite directions)
- Center meeting point with animated heart/ampersand
- Hover on left = slight left tilt, hover right = right tilt
- On scroll: two halves merge together (clip-path animation)
- Names appear with typewriter effect from both sides meeting center
```

### Hero Layout C: "Minimal Scroll Reveal"
```
┌─────────────────────────────────────────┐
│                                         │
│                                         │
│         M & H                           │
│                                         │
│    (huge elegant typography only)       │
│                                         │
│                                         │
│                                         │
│    scroll to discover our story ↓       │
│                                         │
└─────────────────────────────────────────┘
Features:
- Just names in massive typography (120px+)
- Background is a very slow animated gradient
- On scroll: letters separate, photo fades in between
- Ultra-minimal, confidence in whitespace
- Date appears as subtle text at bottom
- Best for: Minimal Luxe, Art Deco themes
```

### Hero Layout D: "Story Card Stack"
```
┌─────────────────────────────────────────┐
│                                         │
│     ┌─────────┐                         │
│     │ Photo   │  ← rotated slightly     │
│     │         │                         │
│     └─────────┘                         │
│   ┌─────────┐                           │
│   │ Photo   │    ← different angle      │
│   │         │                           │
│   └─────────┘                           │
│                                         │
│   Minh & Hương                          │
│   "Our love story in pictures"          │
│   2,190 days and counting...            │
│                                         │
│   ┌─ Countdown ─┐  ┌─ Share ──┐        │
│   └──────────────┘  └──────────┘        │
└─────────────────────────────────────────┘
Features:
- Stack of 3-5 couple photos, slightly rotated (Polaroid style)
- Hover on stack = cards spread out (fan animation)
- Click = fullscreen slideshow
- Photos have subtle continuous rotation animation
- Tape/pin decorations on photos (for Retro/Boho themes)
- Best for: Retro Film, Boho themes
```

### Hero Layout E: "Interactive Globe / Map"
```
┌─────────────────────────────────────────┐
│                                         │
│    ┌──── Map showing love journey ────┐ │
│    │  📍 First met (Saigon)           │ │
│    │  📍 First date (Hồ Tây)         │ │
│    │  📍 Proposal (Đà Lạt)           │ │
│    │  📍 Wedding (...)                │ │
│    └──────────────────────────────────┘ │
│                                         │
│    Minh & Hương                         │
│    Our love story spans 5 cities...     │
│                                         │
└─────────────────────────────────────────┘
Features:
- Interactive map with animated path between locations
- Each pin = a milestone, click for details
- Path draws itself on load (SVG stroke-dashoffset animation)
- Pins appear one by one with pop animation
- Premium feature (uses Mapbox or custom SVG map)
```

---

## PART 3: SECTION-BY-SECTION UI OVERHAUL

### 3.1 — "Couple Stats" Section

CURRENT: Basic number cards, static
NEW: Animated, playful, shareable

```
Option A: "Ticker Tape" — numbers count up with slot-machine animation
Option B: "Infographic Cards" — each stat is an illustrated mini-card
         (e.g., "Trips" shows tiny airplane icon orbiting)
Option C: "Bento Grid" — stats in asymmetric bento box layout
         (one big card, several small ones, different sizes)
Option D: "Progress Ring" — circular progress bars with % fills
         (e.g., "87% of the way to forever" with animated ring)

Enhancement ideas:
- Custom stats: couple can add their own metrics
  ("Lần ăn bún bò cùng nhau: 142", "Phim đã xem: 87")
- Animated emoji next to each stat
- "Shareable card" button → generates Instagram story-sized image
- Stats change color/animation when hovered
- Easter egg: clicking "Days together" fast 10x triggers confetti
```

### 3.2 — "Love Story Timeline"

CURRENT: Basic vertical dots and cards
NEW: Multiple layout modes, immersive

```
Layout Option 1: "Book Pages"
- Each milestone = a "page" in a book
- Swipe/scroll = turning pages with 3D page-flip animation
- Left page: photo, Right page: text
- Subtle paper texture background
- Page number at bottom

Layout Option 2: "Film Reel"
- Horizontal scrolling filmstrip
- Each milestone is a "frame" with sprocket holes on top/bottom
- Drag to scrub through time
- Play button: auto-scrolls with cinematic music note icon
- Film grain overlay on photos

Layout Option 3: "Vertical Immersive"
- Full-width sections, each milestone takes up 60-80vh
- Large background photo with text overlay
- Parallax: photo scrolls slower than text
- Date appears as a huge watermark behind content
- Transitions: crossfade between milestones

Layout Option 4: "Chat Bubbles"
- Styled like a messaging app conversation
- Partner 1 messages on left (blue), Partner 2 on right (pink)
- "Typing..." animation before each message appears
- Include "reactions" on messages
- Photos appear as sent images in chat
- Timestamps between groups

Layout Option 5: "Map Journey" (premium)
- Connected to actual map locations
- Scrolling follows a path on a map
- Each pin point expands into the milestone story
- Animated dotted line draws between points

Enhancements for ALL layouts:
- Background music option: auto-play ambient track
- "Add to my story" — visitors can add their own memory of the couple
- Photo filter matching the theme (warm, cool, vintage, b&w)
- Reaction emojis on each milestone (visitors can react)
```

### 3.3 — "Photo Gallery"

CURRENT: Basic grid with lightbox
NEW: Multiple gallery modes, social-media feel

```
Gallery Mode 1: "Pinterest Masonry"
- Variable height masonry layout
- Lazy load with blur-hash placeholder
- Hover: slight zoom + gradient overlay + caption
- Click: smooth expand-in-place (like Instagram)

Gallery Mode 2: "Polaroid Wall"
- Photos on a "wall" background (cork board, string lights)
- Each photo randomly rotated (-5° to +5°)
- Push pins / tape / clips holding photos
- Hover: straighten + lift + shadow deepens
- Can drag to rearrange (playful, non-persistent)

Gallery Mode 3: "Instagram-style Feed"
- Square grid (3 columns on mobile, 4 on desktop)
- Tap = expand with likes, caption, comments
- Swipe between photos in expanded view
- Double-tap to react with heart animation

Gallery Mode 4: "Film Strip"
- Horizontal continuous scroll
- Tall narrow photos in a strip
- Film sprocket holes decoration
- Drag to scroll, or auto-scroll on hover at edges
- Vintage: sepia/desaturated filter on scroll-away photos

Gallery Mode 5: "Stories Carousel" (like Instagram Stories)
- Circular avatars at top (album covers)
- Tap = fullscreen story viewer with progress bar
- Auto-advance between photos
- Tap left/right to navigate
- Pinch to zoom

Enhancements for ALL modes:
- Album organization with custom covers
- Guest photo upload: visitors can add their photos of the couple
- Photo reactions (❤️ per photo, visible count)
- Download original button (with Momentee watermark on free plan)
- "Create slideshow" — auto-generates video from photos with music
- Smart photo ordering: AI suggests best order (by date, by color, by mood)
```

### 3.4 — "Wishes / Guestbook"

CURRENT: Basic form + card list
NEW: Interactive, emotional, diverse input methods

```
Wish Input Styles:
├── "Classic" — name + text message
├── "Voice Note" — record audio wish (premium)
├── "Video Wish" — record 15-second video (premium)
├── "Drawing" — freehand draw + write on a canvas
├── "Postcard" — choose a template, add photo + message
├── "Song Dedication" — search Spotify, attach song + message
└── "GIF Wish" — pick a GIF (Giphy integration) + message

Wish Display Styles:
├── "Card Wall" — Pinterest-like grid of wish cards
│   (different sizes based on message length)
├── "Chat Stream" — realtime chat-like feed
├── "Floating Bubbles" — wishes as floating bubbles
│   (click to expand, size = reaction count)
├── "Book of Wishes" — flip-through book animation
│   (each page = one wish, handwritten font)
└── "Wall of Love" — Instagram-style scrolling feed

Enhancements:
- Realtime: new wishes fly in from bottom with sound effect
- AI mood detection: auto-assign emoji based on wish sentiment
- Pin feature: couple can pin favorite wishes to top
- "Wish of the day" spotlight
- Reply from couple (verified couple badge on replies)
- Share individual wish as image (for couple's Instagram story)
- Moderation queue with quick approve/reject swipe
- Private wishes: option to send privately to couple only
```

### 3.5 — "Events"

CURRENT: Basic event cards
NEW: Visual, interactive, comprehensive

```
Event Display Options:
├── "Timeline Schedule" — vertical timeline with time + location
│   (animated progress line showing "now" marker on wedding day)
├── "Card Flip" — flip card: front = event name + icon
│   back = full details + map + dress code
├── "Boarding Pass" — styled like airline boarding pass
│   (event name = destination, time = departure, dress = class)
└── "Magazine Spread" — full-width editorial layout per event

Event Features:
- Embedded Google Maps with directions button
- Dress code visual guide (illustrated examples, not just text)
- Weather forecast widget for outdoor events
- "Add to Calendar" (Google, Apple, Outlook) one-click
- Parking info / transportation notes section
- "I'm running late" quick message to couple
- Photo of venue with lightbox
- Seating chart (premium): interactive table map
- Event-specific countdown: "Tiệc cưới starts in 3h 22m"
```

### 3.6 — "Couple Quiz"

CURRENT: Basic multiple choice
NEW: Gamified, competitive, shareable

```
Quiz Enhancements:
├── Question types:
│   ├── Multiple choice (current)
│   ├── Image choice (pick the correct photo)
│   ├── True or False (swipe left/right like Tinder)
│   ├── Fill in the blank ("Their first date was at ___")
│   ├── Emoji match (match the emoji to the event)
│   └── Audio quiz (whose voice is this? — premium)
│
├── Gamification:
│   ├── Timer per question (10 seconds, bar counts down)
│   ├── Streak bonus (3 correct in a row = bonus points)
│   ├── Difficulty levels (easy, medium, expert)
│   ├── Lives system (3 hearts, wrong = lose a heart)
│   ├── Achievements / badges
│   └── "Challenge a friend" share link
│
├── Results screen:
│   ├── Animated score reveal (confetti for high scores)
│   ├── Rank title: "Soulmate Expert" / "Needs More Stalking"
│   ├── Comparison: "You scored higher than 73% of guests!"
│   ├── Shareable result card (Instagram story format)
│   └── Public leaderboard with avatars + scores
│
└── Visual:
    ├── Each question has themed background
    ├── Sound effects (correct ding, wrong buzz, streak fire)
    ├── Animated transitions between questions
    ├── Celebration explosion for perfect score
    └── Couple's reaction GIF for wrong answers (uploadable)
```

### 3.7 — "Love Letter"

CURRENT: Static text in styled container
NEW: Immersive reading experience

```
Love Letter Enhancements:
├── Envelope animation: realistic 3D envelope that opens
│   (tilt device / hover to see inside, click to pull out letter)
├── Handwriting effect: text "writes itself" character by character
│   (using SVG path animation or typewriter effect)
├── Paper texture: aged paper with slight crinkle shadows
│   (CSS filter + background texture)
├── Ink blots: decorative ink stains at corners
├── Wax seal: animated wax seal breaking when opened
├── Audio option: partner can record themselves reading it
│   (play button, voice syncs with text highlighting)
├── Multiple letters: not just 2, but a collection over time
│   (couple can add letters for anniversaries, holidays)
├── Private letters: some visible to all, some only to partner
└── Response letter: partner can write a visible reply
```

---

## PART 4: ADVANCED CUSTOMIZATION (Dashboard)

### 4.1 — "Page Builder" (Drag & Drop Sections)

```
Users can:
├── Reorder sections (drag & drop)
├── Toggle sections on/off (hide what they don't need)
├── Choose layout variant per section (e.g., timeline style)
├── Add custom sections:
│   ├── "Text Block" — free-form rich text
│   ├── "Quote" — highlighted love quote with decoration
│   ├── "Spotify Embed" — "our song" player
│   ├── "YouTube Embed" — our video
│   ├── "Custom HTML" (premium) — full creative freedom
│   └── "Divider" — decorative section separator
└── Preview changes live before publishing

Section order example:
1. Hero (always first, layout selectable)
2. Couple Stats
3. Love Story Timeline
4. Photo Gallery
5. Love Letters (toggleable)
6. Events (toggleable)
7. Quiz (toggleable)
8. Wishes / Guestbook
9. Gift Accounts (toggleable)
10. RSVP
11. Footer (always last)
```

### 4.2 — "Style Editor" (Visual Customizer)

```
Tab 1: Theme
├── Browse 12+ theme presets (visual preview cards)
├── "Customize this theme" button opens editor:
│   ├── Primary color picker (with suggested palette)
│   ├── Background color/image
│   ├── Font pair selector (curated pairs only, not free-text)
│   └── Border radius slider (sharp ↔ round ↔ pill)

Tab 2: Effects
├── Particle type selector (visual preview of each)
├── Cursor effect toggle
├── Scroll animation speed (subtle ↔ dramatic)
├── Parallax intensity slider
├── Background music toggle + upload
└── Section divider style picker

Tab 3: Hero
├── Layout picker (5 options with visual previews)
├── Cover photo upload with position/crop
├── Overlay opacity slider
├── Title size (S / M / L / XL)
├── Quote text input
└── Countdown toggle on/off

Tab 4: Colors (Advanced, premium)
├── Full color override for each element
├── Gradient builder (up to 3 colors, angle, type)
├── Dark mode toggle (auto-generate dark version)
└── Export / Import theme as JSON
```

### 4.3 — Custom CSS Injection (Premium Plus)

```
For power users:
- Code editor with syntax highlighting (Monaco / CodeMirror)
- Live preview side-by-side
- CSS variable overrides (scoped, can't break core layout)
- Template snippets library:
  - "Animated gradient background"
  - "Glassmorphism cards"
  - "Custom cursor"
  - "Neon glow text"
  - etc.
- Max 5000 characters
- Validation: no @import, no external URLs, no position:fixed
```

---

## PART 5: MICRO-INTERACTIONS & DELIGHT DETAILS

These small touches are what make users say "wow" and share:

```
1. "Love Meter" — at the very top of page, thin progress bar
   showing % of page scrolled, styled as a heart filling up

2. "Easter Egg" — click the ampersand (&) between names 10x
   → triggers hidden animation (fireworks, rain of hearts,
   secret message from couple, or rick-roll 😂)

3. "Guestbook Handshake" — when submitting a wish, the cursor
   temporarily changes to a waving hand 👋 for 2 seconds

4. "Photo Memory" — in gallery, one random photo per visit
   has a subtle golden glow (couple's "photo of the day")

5. "Heartbeat" — the heart icon in the hero section subtly
   beats at 72bpm (average heart rate). Hover = beats faster

6. "Ripple Touch" — on mobile, every tap creates a subtle
   ripple effect in the theme's accent color

7. "Scroll Soundtrack" — very quiet ambient sound that changes
   with sections (birds in garden, ocean waves for beach, etc.)
   Muted by default, tiny speaker icon to enable

8. "Wish Counter Live" — small floating badge showing total
   wishes. When someone submits, it bumps up with bounce animation.
   If visiting while someone else is writing, show "someone is
   writing a wish..." typing indicator

9. "Parallax Avatar" — couple photos in hero follow mouse
   slightly (subtle tilt/move), creating 3D depth effect

10. "Section Entry Soundtrack" — each section can have a subtle
    sound effect when it enters viewport (soft chime, page turn,
    camera shutter for gallery). Disabled by default.

11. "Save as Wallpaper" — button on hero section to download
    a phone-wallpaper-sized version of their couple page header

12. "QR Code Art" — the couple's QR code is stylized to look
    like a heart shape, not a boring square
```

---

## PART 6: MOBILE-FIRST RESPONSIVE EXCELLENCE

```
Mobile-specific enhancements:
├── Full-screen sections with snap scroll (CSS scroll-snap)
├── Swipe gestures: swipe up to go to next section
├── Bottom sheet for wish form (slides up from bottom)
├── Haptic feedback on reactions (navigator.vibrate)
├── Floating action button: quick wish / quick RSVP
├── Story-like progress bar at top (dots for each section)
├── Pull to refresh for new wishes
├── Share button always visible (floating, not in header)
├── Landscape mode: hero photo takes full left half
├── Performance: reduce particles count on mobile
│   (20 → 8 particles, disable cursor effects)
├── Touch-friendly: all interactive elements min 44px tap target
└── App-like transitions between sections (slide, not scroll)
```

---

## PART 7: SHARE & VIRALITY FEATURES

```
Share Optimization:
├── Dynamic OG images: auto-generated preview image showing
│   couple photo + names + date in a beautiful card layout
│   (use @vercel/og or Satori for server-side generation)
│
├── Instagram Story integration:
│   ├── "Share to Story" button on every section
│   ├── Generates vertical (1080x1920) image
│   ├── Includes QR code + momentee.app/slug link
│   ├── Themed to match couple's page theme
│   └── Different templates per section:
│       - Hero = couple photo + names + date
│       - Stats = infographic card
│       - Quiz result = score + rank
│       - Wish = individual wish card
│       - Gallery = photo collage
│
├── TikTok-friendly:
│   ├── "Create reel" — auto-generates 15sec slideshow
│   │   from photos + music (downloadable MP4)
│   ├── Vertical-optimized page view mode
│   └── Link-in-bio friendly: page loads fast, mobile-first
│
├── WhatsApp / Zalo / Messenger:
│   ├── Rich preview with couple photo + names
│   ├── Deep link to specific section (e.g., /slug#wishes)
│   └── Quick share buttons with pre-filled messages
│
└── QR Code:
    ├── Stylized QR with couple avatar in center
    ├── Theme-colored (matches page theme)
    ├── Download as PNG (high-res for printing on invitations)
    ├── Option: add custom text around QR
    └── Scannable directly from the page
```

---

## IMPLEMENTATION PRIORITY

```
Sprint 1 (Week 1-2): Theme Engine Foundation
├── Build ThemeProvider with CSS variable injection
├── Implement 4 core themes (Sunset Coral, Midnight Garden, Minimal Luxe, Neon Love)
├── Theme selector in dashboard settings
├── CSS variable system for all colors, fonts, radii
└── Font loading system (Google Fonts dynamic loading)

Sprint 2 (Week 2-3): Hero Section Overhaul
├── Implement 3 hero layouts (Cinematic, Split, Minimal)
├── Parallax scroll system (Framer Motion + scroll hooks)
├── Countdown with flip animation
├── Particle system (configurable via theme)
└── Hero layout selector in dashboard

Sprint 3 (Week 3-4): Section Redesigns
├── Timeline: implement 3 layout variants
├── Gallery: implement 3 gallery modes
├── Wishes: new input styles + display modes
├── All section scroll reveal animations
└── Section divider system (wave, diagonal, etc.)

Sprint 4 (Week 4-5): Customization Dashboard
├── Section drag-and-drop reorder
├── Style editor (colors, fonts, effects)
├── Per-section layout variant picker
├── Live preview system
└── Theme import/export (premium)

Sprint 5 (Week 5-6): Micro-interactions & Polish
├── Easter eggs
├── Sound effects system
├── Advanced mobile optimizations
├── Share image generation (OG + Story)
├── QR code generator
└── Performance audit + optimization

Sprint 6 (Week 6-7): Remaining Themes + Premium Features
├── Build remaining 8 themes
├── Custom CSS injection (premium)
├── Video hero background (premium)
├── Audio wishes (premium)
└── Final QA + cross-browser testing
```

---

## DESIGN TOKENS (CSS Variables)

```css
/* Base tokens — overridden by theme */
:root {
  /* Colors */
  --color-primary: #FF6B6B;
  --color-secondary: #FF8E53;
  --color-accent: #FFC371;
  --color-bg: #FFF8F5;
  --color-surface: #FFFFFF;
  --color-text: #1a1a2e;
  --color-text-muted: #666666;
  --color-border: rgba(0,0,0,0.08);
  --color-gradient: linear-gradient(135deg, var(--color-primary), var(--color-secondary), var(--color-accent));

  /* Typography */
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Sora', sans-serif;
  --font-accent: 'Caveat', cursive;
  --heading-weight: 700;
  --body-weight: 400;

  /* Layout */
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  --section-gap: 100px;
  --content-width: 1080px;

  /* Effects */
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.04);
  --shadow-md: 0 8px 24px rgba(0,0,0,0.06);
  --shadow-lg: 0 16px 48px rgba(0,0,0,0.08);
  --blur: 16px;
  --transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  /* Animation */
  --scroll-reveal-distance: 30px;
  --scroll-reveal-duration: 0.8s;
  --parallax-multiplier: 0.3;
}

/* Theme override example: Midnight Garden */
[data-theme="midnight-garden"] {
  --color-primary: #E879F9;
  --color-secondary: #A78BFA;
  --color-accent: #7C3AED;
  --color-bg: #0F0F23;
  --color-surface: rgba(255,255,255,0.04);
  --color-text: #E8E8F0;
  --color-text-muted: rgba(255,255,255,0.5);
  --color-border: rgba(255,255,255,0.06);
  --font-display: 'Playfair Display', serif;
  --font-body: 'Poppins', sans-serif;
}
```

---

*This plan transforms Momentee couple pages from generic templates into truly personal, share-worthy experiences. Feed each sprint to Claude Code sequentially.*
