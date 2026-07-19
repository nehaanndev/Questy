# Questling QA Report

Status: final integration audit. Automated release gates pass. The QA worker had no browser backend, but the coordinating agent completed a live in-app-browser pass for the primary journey, companions, settings, phone overflow, and browser console.

## Quality goals

Questling should feel like a coherent learning game, not a gallery of disconnected mockups. Every visible control must do something understandable, every one of the 24 planned screens must be reachable without developer shortcuts, and question feedback must remain traceable to the uploaded source.

The primary acceptance path is:

1. Land on **First Steps** as the returning-user home screen.
2. Open the Source Library and add a PDF or explicitly choose the demo realm.
3. See clear processing, success, and recoverable failure states.
4. Return to First Steps and enter a quest through an obvious hotspot or panel.
5. Discover a grounded clue, start an encounter, answer questions, and inspect citations.
6. Complete the quest, review mistakes, receive progress, and bond with or collect a companion.
7. Revisit the journal, mastery, team, wardrobe, inventory, settings, and account screens through persistent navigation.

## Baseline verification — July 18, 2026

| Check | Result | Evidence |
| --- | --- | --- |
| Unit/component/API tests | Pass | 6 files, 28 tests, including release-journey, deletion-regression, and upload-guard QA tests |
| ESLint | Pass | `npm run lint` |
| Production build and type checking | Pass | `npm run build`; `/` static and `/api/generate-questions` dynamic |
| Current line limits | Pass | Largest source file is `app/globals.css` at 553 lines; every TypeScript/TSX module is well below 600 lines |
| Art assets | Pass by direct inspection | Three avatars and five creatures/enemies are present at 1254×1254 and share the intended dark emerald, teal, violet, and gold visual language |
| Browser automation | Pass for sampled release paths | In-app-browser checks covered First Steps, Source → Discover → Journal → Battle, Sanctuary/Codex/Team, Settings, 390×844 Codex overflow, and an empty warning/error console |

The refactor is structurally successful: screen rendering is separated by product area, shared state lives in a provider, reusable art and UI primitives are isolated, and no implementation file exceeds 600 lines. Some older dense CSS remains in `globals.css`, but the new finishing layer and art system are documented and separated.

## 24-screen acceptance checklist

The **Automated today** column describes the final integration test evidence. “Static” means the implementation and navigation handler were inspected but not exercised in a live browser.

| # | Screen | Required behavior | Automated today | Final QA focus |
| --- | --- | --- | --- | --- |
| 01 | Create Your Avatar | Face, hair, outfit, and voice tabs; visible selection; avatar preview changes; Continue persists choices | Partial | Verify all choices have distinct visuals, keyboard selection, and persistence into wardrobe/home |
| 02 | Build Your World | Real PDF picker, demo option, source list selection, size/type guidance, clear progress/errors | Partial | Test valid, invalid, empty, oversized, cancelled, server-error, and retry paths |
| 03 | Realm Awakening | Processing steps communicate progress without pretending completion; success enables entry; failure returns safely | Partial | Test slow request, failure, aborted upload, focus announcement, and no impossible percentages |
| 04 | First Steps | New home screen; avatar and companion visible; obvious interactive destinations; return visits preserve progress | Automated + live browser | Default home, destination navigation, source/quest/companion entry, detailed art, and home-brand return pass |
| 05 | Quest Journal | Quest selection, objective list, tracked state, question count, encounter start | Automated primary path | Encounter start passes; persistence and every quest variant remain future coverage |
| 06 | Discover & Learn | Source fragment, citation, Save Clue, Continue | Automated | Save state, live notice, journal continuation, and source-grounded copy pass |
| 07 | Tactical Encounter | Command selection, answer choices, health/focus updates, grounded feedback, progression | Automated primary path | Correct and incorrect feedback paths pass; full six-question completion remains future coverage |
| 08 | Quest Complete | Accurate score, mastery/bond rewards, inventory reward, review and continue actions | None | Validate score/reward math and both exits |
| 09 | Companion Sanctuary | Companion selection plus Call, Feed, Train, Codex, and Team destinations | Navigation only | Verify actions provide delightful visible/announced feedback and cannot inflate bond incorrectly |
| 10 | Companion Codex | Habitat tabs, creature cards, detailed profile, team toggle | Automated primary path | Water filter, Shellback selection, team toggle, and keyboard tab navigation pass |
| 11 | Bond Path | Selected companion identity, bond level, traits/skills, Spend Time | None | Verify skill states, max level, repeated actions, reward feedback, and selected companion consistency |
| 12 | Team Setup | Select up to three, swap from bench, save team, exploration/battle roles | Automated primary path | Three-member constraint and save notice pass; every swap permutation remains future coverage |
| 13 | Source Library | Add material, accessible source rows, status/pages/date, manage uploads, enter realm | Automated primary path | Home entry, source-row detail, and realm return pass; real upload success is not mocked at component level |
| 14 | Source Details | Preview, topics, confidence, grounding statement, activate, reprocess, delete, enter realm | Automated primary path | Grounding copy, realm entry, and target-specific deletion pass |
| 15 | Mastery Atlas | Select topic nodes, accurate percentages, recommended review, start review quest | None | Verify topic detail changes, color is not sole signal, and review starts with correct topic |
| 16 | Answer Review | User answer, correct answer, explanation, exact source excerpt/page, report/open/got-it | None | Test several reviewed answers, page linkage, report acknowledgement, empty-review fallback |
| 17 | Avatar & Wardrobe | Category tabs, preview selection, locked state, Equip, Save Look | Automated guard | Locked choices are semantically disabled and rejected by the equip handler; persistence across every screen remains future coverage |
| 18 | Inventory & Relics | Category tabs, item selection/detail, usable state and result | None | Test items with and without actions, quantities, used/equipped state, and clear feedback |
| 19 | Journey Progress | Day path, goal progress, achievement progress, links to relevant activity | None | Verify data consistency with completed actions and meaningful empty/new-user state |
| 20 | Settings & Accessibility | Toggles, control presets, sliders, privacy, save and restore | Automated primary path | Reduced-motion/large-text classes, persistence, privacy navigation, and keyboard tabs pass |
| 21 | Begin Your Journey | New-user entry only after First Steps becomes home; create/sign-in/guest are functional | Partial | Confirm product decision: separate onboarding route/modal versus a home-screen entry state |
| 22 | Pause & Navigation | Resume prior screen; Journal, Library, Companions, Settings, Title | Automated primary path | Settings route passes; multi-origin Resume remains future coverage |
| 23 | Source Needs Attention | Low-confidence pages, page review, OCR retry, remove confirmation | None | Verify page-by-page state, retry progress/error, reviewed count, and no questions from excluded pages |
| 24 | Account & Privacy | Profile/data/uploads/parental tabs; export/manage/delete flows | Automated confirmation and action paths | Initial focus, focus trap, Escape cancellation, focus restoration, export, clear-progress, delete-uploads, and delete-account handlers pass |

## Navigation and state checklist

- [x] First Steps is the default returning-user screen and reads as the central home hub.
- [ ] All 24 screens are reachable through visible UI; no screen exists only in the `SCREEN_IDS` array.
- [ ] Each screen has a reliable route back to First Steps or Pause.
- [ ] Pause resumes the exact prior screen, including its selected tab/item and scroll state.
- [ ] Browser refresh has an intentional result: restore the local prototype state or clearly restart it.
- [ ] Quest, selected source, avatar, active companion, team, wardrobe, settings, inventory, and progress do not contradict one another across screens.
- [x] Every visible button, card that looks clickable, tab, slider, checkbox, and hotspot has a real handler and perceivable feedback in the implemented prototype.
- [x] Disabled or locked actions are semantically disabled and explain why.
- [ ] Loading actions cannot be double-submitted.
- [x] Confirmation dialogs describe the exact affected data and return focus to their trigger when cancelled.
- [ ] Error states offer a useful next action rather than only displaying a failure message.

## PDF and AI question-generation checklist

Existing route tests cover missing API configuration, non-PDF uploads, empty PDFs, and renamed files without a PDF signature. The route also implements a 15 MB limit, per-address rate limiting, OpenAI timeout/retry configuration, structured output, and server-side pack validation.

Still required:

- [x] Missing `file` form field returns the intended 400 message.
- [x] A PDF over 15 MB returns 413 before contacting OpenAI.
- [ ] A valid PDF success response is mocked and schema validated in a route test.
- [ ] Invalid/empty OpenAI output returns a learner-safe error without exposing internals.
- [ ] OpenAI authentication, timeout, generic 500, and 429 responses map to the intended copy.
- [ ] Rate-limit count and `Retry-After` behavior are deterministic in tests.
- [ ] Client upload cancellation and component unmount abort the request without showing a false error.
- [ ] Retrying after failure does not duplicate the source row.
- [ ] Generated question count, topics, source name, evidence quote, and page label appear consistently in the UI.
- [ ] Handwritten/low-confidence pages can be excluded or reviewed before their content becomes a question.
- [ ] Demo mode is visually explicit so learners never mistake demo questions for content from their own PDF.

## Responsive and interaction checklist

Test at minimum at 1440×900, 1024×768, 768×1024, 390×844, and 844×390.

- [ ] No panel, dialog, tab row, page thumbnail, battle answer, or action button is clipped.
- [ ] Small screens preserve a clear primary action without requiring precision taps.
- [ ] Touch targets are at least approximately 44×44 CSS pixels.
- [ ] Hover-only information is also available through focus/tap.
- [ ] Background art remains supportive and never lowers text contrast or hides a hotspot.
- [ ] Long PDF names, topic names, creature names, and translated/large text wrap safely.
- [ ] Mobile landscape does not trap the user in a fixed-height scene.
- [ ] Large-text mode reflows rather than merely scaling into overlap.
- [ ] Reduced-motion settings and `prefers-reduced-motion` remove nonessential motion.
- [ ] Sliders and tabs work with keyboard as well as pointer/touch.

## Accessibility checklist

Current strengths include a visible global `:focus-visible` outline, semantic buttons for most interactions, labels around form controls, live status announcements, keyboard-operable tabs, applied accessibility classes, and an aria-labelled confirmation dialog that supports initial focus, Escape cancellation, and trigger-focus restoration.

Current gaps to close:

- [x] Global notices use an `aria-live` status region.
- [x] Tabs implement Left/Right arrow-key movement and a roving `tabIndex`.
- [ ] Tabs still need `aria-controls` and associated `tabpanel` elements.
- [x] Dialogs receive initial focus, close on Escape, and restore focus on close.
- [x] Dialogs trap Tab/Shift+Tab focus within the confirmation controls.
- [ ] Destructive dialog backdrops do not accidentally dismiss or obscure the action.
- [ ] Decorative glyphs/emoji are hidden from assistive technology when redundant.
- [ ] Creature/avatar visuals have useful names without reading decorative details repeatedly.
- [ ] Active, selected, completed, wrong, and correct states are not indicated by color alone.
- [ ] Screen changes move focus to the new screen heading or announce navigation.
- [ ] Source thumbnails and uploaded-document previews have context-specific alternative text.
- [ ] Heading order is coherent within every screen.
- [x] Settings apply reduced motion, contrast, larger text, and dyslexia-friendly classes to the experience.
- [ ] Automated axe or equivalent accessibility coverage is added if the dependency budget permits it.

## Clarity and delight checklist

- [ ] First Steps immediately answers: “Where am I?”, “What should I do next?”, and “What will studying accomplish?”
- [ ] Panels are compact, evenly filled, and visually grouped like the supplied references; no floating orphan text.
- [ ] Avatar, companion, and enemy art feel like members of one world and remain identifiable at card, scene, and battle sizes.
- [ ] Feedback is specific: name the companion, item, topic, source, or progress that changed.
- [ ] Correct answers feel rewarding without slowing study; incorrect answers feel recoverable and never punitive.
- [ ] Companion bonding is tied to learning progress rather than repetitive clicking alone.
- [ ] Empty states suggest a meaningful action.
- [ ] Labels favor learner language over implementation terms such as OCR or schema unless briefly explained.
- [ ] Demo notices, autosave copy, and prototype-only actions are honest and consistent.

## Final automated coverage and remaining gaps

The combined suite now confirms 24 unique screen IDs; First Steps as the initial home; home shortcuts and home-brand return; onboarding and demo-realm processing; Source Library → Source Details → First Steps → Discover → Journal → Battle; both correct and incorrect battle feedback; clue saving; Codex filtering; keyboard tab navigation; companion team selection and save feedback; applied accessibility classes; settings persistence; confirmation-dialog initial focus, Escape, and focus restoration; missing-file upload rejection; and the 15 MB server-side upload limit.

It does **not** yet prove:

- every secondary control across all 24 screens;
- full six-question completion, final score/reward math, multi-answer review, or evidence-page paging;
- upload success, server failure, retry, and request cancellation in the component;
- a downloaded export file's contents across every browser;
- the full desktop/tablet/phone matrix beyond the sampled desktop and 390×844 checks;
- a complete Tab-order audit across every secondary screen;
- absence of console/runtime errors for every secondary screen; the sampled release journey produced no warnings or errors.

QA additions in this iteration:

- `components/QuestlingApp.qa.test.tsx`
- `app/api/generate-questions/route.qa.test.ts`

## Final implementation findings

The implementation team resolved the functional defects found during the final QA loop:

- Account actions now use stable action IDs; clearing local progress, deleting uploaded materials, and deleting the account perform their intended local actions.
- Source Details now includes the selected source in its confirmation action, and the handler removes that exact source. A regression test deletes the second source while preserving the first.
- The generated Sanctuary art grid now has dedicated tablet and phone rules with fluid columns.
- Locked wardrobe options are disabled and cannot be equipped.
- Changing avatar categories resets to a valid visible choice, avoiding the prior preview/selection mismatch.
- Changing a Codex habitat selects the first companion in that habitat, keeping grid and detail consistent.
- The confirmation dialog now traps Tab/Shift+Tab in addition to supporting initial focus, Escape, and trigger-focus restoration.
- Settings are restored from local storage, and Export Learning Data creates a JSON download instead of only displaying a notice.

Remaining limitations:

1. Avatar face, hair, outfit, and voice choices are prototype selections and are not yet stored independently as a composed avatar model.
2. Some battle commands demonstrate selection/preparation rather than a complete RPG combat system.
3. The real PDF success/failure/cancellation path and the unsampled responsive breakpoints still need a manual pass.
4. Generated art is internally consistent and substantially more detailed. Direct inspection and sampled live screens confirmed that the three avatar paintings, three collectible companion paintings, and two enemy paintings share the same night-forest/archive palette and rendering style.

## Database recommendation

A database is **not required** to complete or evaluate this single-browser prototype, so implementation should remain on hold for now.

A database becomes appropriate when the product needs real accounts, cross-device saves, private upload metadata, generated question-pack persistence, longitudinal mastery, companion/team inventory, or parental/teacher views. Before adding one, define the ownership and deletion model for source documents, generated questions, answers, and learner progress. The current local state is sufficient to validate the UX without prematurely locking in that schema.

## Release gate for this iteration

| Gate | Status |
| --- | --- |
| Tests, lint, type checking, and production build | Pass |
| First Steps is the new home; onboarding remains reachable | Pass |
| No implementation source file exceeds 600 lines | Pass |
| Primary home → source → discovery → quest → battle journey | Pass in component-level integration QA |
| Companion Codex → team journey | Pass in component-level integration QA |
| Settings, keyboard tabs, and confirmation cancellation | Pass in component-level integration QA |
| PDF input guards | Pass for missing, type, signature, empty, and oversized files |
| Real PDF success/failure/cancellation | Partial; route and client logic exist, but no final live upload was performed |
| Desktop/tablet/mobile visual inspection | Partial pass; desktop journey and 390×844 Codex checked live with no horizontal overflow; full breakpoint matrix remains follow-up |
| Browser console free of runtime errors | Pass for sampled release journey; zero warnings/errors captured |
| Destructive account/source behavior | Pass in regression tests for selected-source and all-upload deletion |

Recommendation: the redesign is suitable for continued prototype review. Before a public release, complete the remaining breakpoint matrix and a live OpenAI-backed PDF success/failure/cancellation pass.
