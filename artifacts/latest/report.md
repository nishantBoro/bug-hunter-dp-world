# Bug Hunter Report

Total findings: 15

## Findings

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /
- Owner: frontend
- Repro:
  - Open / on viewport desktop
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/desktop/_.png
- Console excerpt:
  - Seeded runtime error from homepage.
  - Failed to load resource: the server responded with a status of 500 (Internal Server Error)
  - Failed to load resource: the server responded with a status of 404 (Not Found)
  - Seeded rejected promise.

### Network/API failures detected [HIGH]
- Category: network
- Route: /
- Owner: shared
- Repro:
  - Open /
  - Inspect network panel
  - Observe failed request(s)
- Suspected cause: Broken endpoint, missing asset, timeout, or contract mismatch
- Screenshot: screenshots/desktop/_.png
- Network excerpt:
  - 500 GET http://127.0.0.1:4173/api/error

### UI regression signals detected [MEDIUM]
- Category: ui
- Route: /
- Owner: frontend
- Repro:
  - Open / on viewport desktop
  - Inspect interactive controls and text layout
  - Observe overlaps, clipping, or inaccessible controls
- Suspected cause: Layout/CSS regression affecting interactive affordances
- Screenshot: screenshots/desktop/_.png
- Console excerpt:
  - hiddenPrimaryActions: 0
  - offscreenInteractive: 1
  - clippedTextNodes: 1
  - overlapPairs: 0
- Details: {"hiddenPrimaryActions":[],"offscreenInteractive":["Offscreen Action"],"clippedTextNodes":1,"overlapPairs":0}

### Performance regression over configured baseline [MEDIUM]
- Category: performance
- Route: /slow.html
- Owner: frontend
- Repro:
  - Visit /slow.html
  - Measure route navigation duration
  - Compare against baseline
- Suspected cause: Blocking JS/CSS or expensive render path
- Screenshot: screenshots/desktop/_slow.html.png
- Details: Observed 1850ms vs baseline 1000ms (+85.0%)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /login-loop.html
- Owner: frontend
- Repro:
  - Navigate to /login-loop.html
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Auth/session redirect guard loop
- Screenshot: screenshots/desktop/_login-loop.html.png
- Details: {"blankScreenDetected":false,"redirectLoopDetected":true}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /missing.html
- Owner: frontend
- Repro:
  - Open /missing.html on viewport desktop
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/desktop/_missing.html.png
- Console excerpt:
  - Failed to load resource: the server responded with a status of 404 (Not Found)

### Network/API failures detected [HIGH]
- Category: network
- Route: /missing.html
- Owner: shared
- Repro:
  - Open /missing.html
  - Inspect network panel
  - Observe failed request(s)
- Suspected cause: Broken endpoint, missing asset, timeout, or contract mismatch
- Screenshot: screenshots/desktop/_missing.html.png
- Network excerpt:
  - 404 GET http://127.0.0.1:4173/missing.html

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /
- Owner: frontend
- Repro:
  - Open / on viewport mobile
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/mobile/_.png
- Console excerpt:
  - Seeded runtime error from homepage.
  - Failed to load resource: the server responded with a status of 500 (Internal Server Error)
  - Seeded rejected promise.

### Network/API failures detected [HIGH]
- Category: network
- Route: /
- Owner: shared
- Repro:
  - Open /
  - Inspect network panel
  - Observe failed request(s)
- Suspected cause: Broken endpoint, missing asset, timeout, or contract mismatch
- Screenshot: screenshots/mobile/_.png
- Network excerpt:
  - 500 GET http://127.0.0.1:4173/api/error

### UI regression signals detected [MEDIUM]
- Category: ui
- Route: /
- Owner: frontend
- Repro:
  - Open / on viewport mobile
  - Inspect interactive controls and text layout
  - Observe overlaps, clipping, or inaccessible controls
- Suspected cause: Layout/CSS regression affecting interactive affordances
- Screenshot: screenshots/mobile/_.png
- Console excerpt:
  - hiddenPrimaryActions: 0
  - offscreenInteractive: 1
  - clippedTextNodes: 1
  - overlapPairs: 0
- Details: {"hiddenPrimaryActions":[],"offscreenInteractive":["Offscreen Action"],"clippedTextNodes":1,"overlapPairs":0}

### Performance regression over configured baseline [MEDIUM]
- Category: performance
- Route: /slow.html
- Owner: frontend
- Repro:
  - Visit /slow.html
  - Measure route navigation duration
  - Compare against baseline
- Suspected cause: Blocking JS/CSS or expensive render path
- Screenshot: screenshots/mobile/_slow.html.png
- Details: Observed 1841ms vs baseline 1000ms (+84.1%)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /login-loop.html
- Owner: frontend
- Repro:
  - Navigate to /login-loop.html
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Auth/session redirect guard loop
- Screenshot: screenshots/mobile/_login-loop.html.png
- Details: {"blankScreenDetected":false,"redirectLoopDetected":true}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /missing.html
- Owner: frontend
- Repro:
  - Open /missing.html on viewport mobile
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/mobile/_missing.html.png
- Console excerpt:
  - Failed to load resource: the server responded with a status of 404 (Not Found)

### Network/API failures detected [HIGH]
- Category: network
- Route: /missing.html
- Owner: shared
- Repro:
  - Open /missing.html
  - Inspect network panel
  - Observe failed request(s)
- Suspected cause: Broken endpoint, missing asset, timeout, or contract mismatch
- Screenshot: screenshots/mobile/_missing.html.png
- Network excerpt:
  - 404 GET http://127.0.0.1:4173/missing.html

### Journey failed: broken-submit-flow [CRITICAL]
- Category: functional
- Route: http://127.0.0.1:4173/
- Owner: frontend
- Repro:
  - Run journey 'broken-submit-flow' from config
  - Execute the listed steps in order
  - Observe failure at current step
- Suspected cause: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#submit-btn')[22m
[2m    - locator resolved to <button type="button" id="submit-btn">Submit</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div class="overlap-b"></div> intercepts pointer events[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div class="overlap-b"></div> intercepts pointer events[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    55 × waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="overlap-b"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m

- Screenshot: screenshots/desktop/http_127.0.0.1_4173_.png
- Details: page.click: Timeout 30000ms exceeded.
Call log:
[2m  - waiting for locator('#submit-btn')[22m
[2m    - locator resolved to <button type="button" id="submit-btn">Submit</button>[22m
[2m  - attempting click action[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div class="overlap-b"></div> intercepts pointer events[22m
[2m    - retrying click action[22m
[2m    - waiting 20ms[22m
[2m    2 × waiting for element to be visible, enabled and stable[22m
[2m      - element is visible, enabled and stable[22m
[2m      - scrolling into view if needed[22m
[2m      - done scrolling[22m
[2m      - <div class="overlap-b"></div> intercepts pointer events[22m
[2m    - retrying click action[22m
[2m      - waiting 100ms[22m
[2m    55 × waiting for element to be visible, enabled and stable[22m
[2m       - element is visible, enabled and stable[22m
[2m       - scrolling into view if needed[22m
[2m       - done scrolling[22m
[2m       - <div class="overlap-b"></div> intercepts pointer events[22m
[2m     - retrying click action[22m
[2m       - waiting 500ms[22m

    at runStep (/Users/Nishant.Boro/Downloads/bug-hunter/src/scanner/journeyRunner.ts:19:18)
    at runScriptedJourneys (/Users/Nishant.Boro/Downloads/bug-hunter/src/scanner/journeyRunner.ts:45:17)
    at runBugHunter (/Users/Nishant.Boro/Downloads/bug-hunter/src/run.ts:36:27)
    at main (/Users/Nishant.Boro/Downloads/bug-hunter/src/pilot.ts:48:20)

## Route timings

- / (desktop): 66ms | console=3 | network=1
- /slow.html (desktop): 1850ms | console=0 | network=0
- /login-loop.html (desktop): 146ms | console=0 | network=0
- /missing.html (desktop): 40ms | console=1 | network=1
- / (mobile): 45ms | console=2 | network=1
- /slow.html (mobile): 1841ms | console=0 | network=0
- /login-loop.html (mobile): 147ms | console=0 | network=0
- /missing.html (mobile): 38ms | console=1 | network=1