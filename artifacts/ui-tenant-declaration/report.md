# Bug Hunter Report

Total findings: 23

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
  - Failed to load resource: the server responded with a status of 401 ()
  - ERROR:  tn
  - ERROR:  undefined
  - Unrecognized Content-Security-Policy directive 'none'.
  - Failed to load resource: the server responded with a status of 404 ()
  - Failed to load resource: the server responded with a status of 404 ()
  - Unrecognized Content-Security-Policy directive 'none'.

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
  - GET https://api-accountsuat.cargoes.com/clientnew/additionalInfo net::ERR_ABORTED
  - GET https://www.googletagmanager.com/gtm.js?id=GTM-K9VTQN3 net::ERR_ABORTED
  - GET https://use.fontawesome.com/releases/v5.13.0/css/all.css net::ERR_ABORTED
  - POST https://www.google.com/ccm/collect?rcb=18&frm=0&ae=g&auid=1300466419.1781257503&dt=Cargoes%20Community&en=page_view&dr=euuat-community.cargoes.com&dl=https%3A%2F%2Fstaging-login.cargoes.com%2Fauth%2Frealms%2Fdtworld%2Fprotocol%2Fopenid-connect%2Fauth&scrsrc=www.googletagmanager.com&rnd=871891771.1781257503&navt=n&npa=0&ep.ads_data_redaction=1&gdid=dOThhZD&_tu=CA&gtm=45He66a1v857968348za200zd857968348xea&gcs=G111&gcd=13v3v3l3l5l1&dma=0&tag_exp=115938465~115938468~119456239~119456247&apve=1&apvf=f&apvc=1&tft=1781257502996&tfd=3735 net::ERR_ABORTED
  - POST https://www.google-analytics.com/g/collect?v=2&tid=G-M98PD8KM4Y&gtm=45je66a1v9110688394z8857968348za20gzb857968348zd857968348&_p=1781257499712&gcs=G111&gcd=13v3v3l3l5l1&npa=0&dma=0&gdid=dOThhZD&are=1&cid=1790194577.1781257503&frm=0&pscdl=noapi&rcb=15&sr=1440x900&uaa=arm&uab=64&uafvl=Google%2520Chrome%3B149.0.7827.103%7CChromium%3B149.0.7827.103%7CNot)A%253BBrand%3B24.0.0.0&uam=&uamb=0&uap=macOS&uapv=26.2.0&uaw=0&ul=en-gb&_s=1&tag_exp=115938465~115938468~119392697~119392705~119456239~119456247&sid=1781257503&sct=1&seg=0&dl=https%3A%2F%2Fstaging-login.cargoes.com%2Fauth%2Frealms%2Fdtworld%2Fprotocol%2Fopenid-connect%2Fauth%3Fresponse_type%3Dcode%26client_id%3DEU%26state%3DQkM5LWN-c1lEQU5rd1pTdEEua01wSjg2VTM5d35wdWxneUk5VWhOdjVWS21V%253B%25252Flanding%26redirect_uri%3Dhttps%253A%252F%252Feuuat-community.cargoes.com%252Fgeneric%252F%2523%252Flanding%26scope%3Dopenid%26code_challenge%3DcZXb2Xfaxb3OkoFycprXQ4jVbPU2Hj9pvbhStTHCruQ%26code_challenge_method%3DS256%26nonce%3DQkM5LWN-c1lEQU5rd1pTdEEua01wSjg2VTM5d35wdWxneUk5VWhOdjVWS21V&dr=https%3A%2F%2Feuuat-community.cargoes.com%2F&dt=Cargoes%20Community&_tu=CA&en=page_view&_fv=1&_nsi=1&_ss=1&up.referring_domain=https%3A%2F%2Feuuat-community.cargoes.com%2Fgeneric%2F%23%2Flanding&up.domain_id=EU&tfd=3910 net::ERR_ABORTED
  - 401 POST https://euuat-community.cargoes.com/notification-api/notifications/search
  - 404 GET https://staging-login.cargoes.com/auth/resources/lxdev/login/Cargoes/EU/video/clientreg-login.mp4?version=Release-v26.09.01_6
  - 404 GET https://api-accountsuat.cargoes.com/referential-api/crp-banner?tenantCode=EU

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
  - clippedTextNodes: 0
  - overlapPairs: 0
- Details: {"hiddenPrimaryActions":[],"offscreenInteractive":["Contact Us"],"clippedTextNodes":0,"overlapPairs":0}

### Performance regression over configured baseline [MEDIUM]
- Category: performance
- Route: /
- Owner: frontend
- Repro:
  - Visit /
  - Measure route navigation duration
  - Compare against baseline
- Suspected cause: Blocking JS/CSS or expensive render path
- Screenshot: screenshots/desktop/_.png
- Details: Observed 7993ms vs baseline 2000ms (+299.7%)

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui
- Owner: frontend
- Repro:
  - Open /eu-ui on viewport desktop
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/desktop/_eu-ui.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui
- Owner: frontend
- Repro:
  - Navigate to /eu-ui
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/desktop/_eu-ui.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui/#//user-reporting
- Owner: frontend
- Repro:
  - Open /eu-ui/#//user-reporting on viewport desktop
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/desktop/_eu-ui_user-reporting.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui/#//user-reporting
- Owner: frontend
- Repro:
  - Navigate to /eu-ui/#//user-reporting
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/desktop/_eu-ui_user-reporting.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui/#/update-form/:action/:id
- Owner: frontend
- Repro:
  - Open /eu-ui/#/update-form/:action/:id on viewport desktop
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/desktop/_eu-ui_update-form_action_id.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui/#/update-form/:action/:id
- Owner: frontend
- Repro:
  - Navigate to /eu-ui/#/update-form/:action/:id
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/desktop/_eu-ui_update-form_action_id.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui/#/view-declaration/:id
- Owner: frontend
- Repro:
  - Open /eu-ui/#/view-declaration/:id on viewport desktop
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/desktop/_eu-ui_view-declaration_id.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui/#/view-declaration/:id
- Owner: frontend
- Repro:
  - Navigate to /eu-ui/#/view-declaration/:id
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/desktop/_eu-ui_view-declaration_id.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

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
  - Failed to load resource: the server responded with a status of 401 ()
  - ERROR:  tn
  - ERROR:  undefined
  - ERROR undefined
  - Unrecognized Content-Security-Policy directive 'none'.
  - Failed to load resource: the server responded with a status of 404 ()
  - Failed to load resource: the server responded with a status of 404 ()
  - Unrecognized Content-Security-Policy directive 'none'.

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
  - POST https://bam.eu01.nr-data.net/1/NRJS-45439283769990ac614?a=538520124&sa=1&v=1.243.1&t=Unnamed%20Transaction&rst=645&ck=0&s=ed214f32c4268952&ref=https://euuat-community.cargoes.com/generic/&af=err,xhr,stn,ins,spa&be=238&fe=206&dc=176&perf=%7B%22timing%22:%7B%22of%22:1781257508967,%22n%22:0,%22f%22:51,%22dn%22:51,%22dne%22:51,%22c%22:51,%22s%22:51,%22ce%22:51,%22rq%22:52,%22rp%22:239,%22rpe%22:240,%22di%22:277,%22ds%22:414,%22de%22:414,%22dc%22:443,%22l%22:443,%22le%22:444%7D,%22navigation%22:%7B%7D%7D&fp=476 net::ERR_ABORTED
  - POST https://euuat-community.cargoes.com/notification-api/notifications/search net::ERR_ABORTED
  - POST https://www.google.com/ccm/collect?rcb=15&frm=0&ae=g&auid=1300466419.1781257503&dt=Cargoes%20Community&en=page_view&dr=euuat-community.cargoes.com&dl=https%3A%2F%2Fstaging-login.cargoes.com%2Fauth%2Frealms%2Fdtworld%2Fprotocol%2Fopenid-connect%2Fauth&scrsrc=www.googletagmanager.com&rnd=489214358.1781257510&navt=n&npa=0&ep.ads_data_redaction=0&_tu=CA&gtm=45He66a1v857968348za200zd857968348xea&gcs=G111&gcd=13v3v3l3l5l1&dma=0&tag_exp=115938466~115938468~119456239~119456247&apve=1&apvf=f&apvc=1&tft=1781257509920&tfd=287 net::ERR_ABORTED
  - 401 GET https://api-accountsuat.cargoes.com/clientnew/additionalInfo
  - 404 GET https://staging-login.cargoes.com/auth/resources/lxdev/login/Cargoes/EU/video/clientreg-login.mp4?version=Release-v26.09.01_6
  - 404 GET https://api-accountsuat.cargoes.com/referential-api/crp-banner?tenantCode=EU

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
  - offscreenInteractive: 6
  - clippedTextNodes: 0
  - overlapPairs: 0
- Details: {"hiddenPrimaryActions":[],"offscreenInteractive":["SIGN UP","Privacy Policy","Terms And Conditions","Acceptable Use Policy","Cookie Policy","Contact Us"],"clippedTextNodes":0,"overlapPairs":0}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui
- Owner: frontend
- Repro:
  - Open /eu-ui on viewport mobile
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/mobile/_eu-ui.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui
- Owner: frontend
- Repro:
  - Navigate to /eu-ui
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/mobile/_eu-ui.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui/#//user-reporting
- Owner: frontend
- Repro:
  - Open /eu-ui/#//user-reporting on viewport mobile
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/mobile/_eu-ui_user-reporting.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui/#//user-reporting
- Owner: frontend
- Repro:
  - Navigate to /eu-ui/#//user-reporting
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/mobile/_eu-ui_user-reporting.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui/#/update-form/:action/:id
- Owner: frontend
- Repro:
  - Open /eu-ui/#/update-form/:action/:id on viewport mobile
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/mobile/_eu-ui_update-form_action_id.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui/#/update-form/:action/:id
- Owner: frontend
- Repro:
  - Navigate to /eu-ui/#/update-form/:action/:id
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/mobile/_eu-ui_update-form_action_id.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

### Runtime errors detected in browser console [HIGH]
- Category: runtime
- Route: /eu-ui/#/view-declaration/:id
- Owner: frontend
- Repro:
  - Open /eu-ui/#/view-declaration/:id on viewport mobile
  - Open browser devtools console
  - Observe uncaught errors/rejections
- Suspected cause: Unhandled exception or rejected promise in route script
- Screenshot: screenshots/mobile/_eu-ui_view-declaration_id.png
- Console excerpt:
  - OAUTH Config Not Available.
  - OAUTH Config Not Available.
  - ERROR TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)
  - TypeError: Cannot read properties of null (reading 'split')
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:725857)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at ua.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:730113)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:565961)
    at https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351837
    at Object.handle (https://euuat-community.cargoes.com/eu-ui/polyfills.f8ec2c7f0b2b6cf3.js?_=1779715384252:1:351862)
    at A.intercept (https://euuat-community.cargoes.com/eu-ui/main.d8a4ee3f6f781a6c.js?_=1779715384252:1:562484)

### Functional navigation break detected [CRITICAL]
- Category: functional
- Route: /eu-ui/#/view-declaration/:id
- Owner: frontend
- Repro:
  - Navigate to /eu-ui/#/view-declaration/:id
  - Observe route behavior
  - Notice blank screen or redirect loop
- Suspected cause: Route render failure or state hydration issue
- Screenshot: screenshots/mobile/_eu-ui_view-declaration_id.png
- Details: {"blankScreenDetected":true,"redirectLoopDetected":false}

## Route timings

- / (desktop): 7993ms | console=7 | network=8
- /eu-ui (desktop): 1395ms | console=4 | network=0
- /eu-ui/#//user-reporting (desktop): 783ms | console=4 | network=0
- /eu-ui/#/update-form/:action/:id (desktop): 778ms | console=4 | network=0
- /eu-ui/#/view-declaration/:id (desktop): 770ms | console=4 | network=0
- / (mobile): 2022ms | console=8 | network=6
- /eu-ui (mobile): 773ms | console=4 | network=0
- /eu-ui/#//user-reporting (mobile): 795ms | console=4 | network=0
- /eu-ui/#/update-form/:action/:id (mobile): 761ms | console=4 | network=0
- /eu-ui/#/view-declaration/:id (mobile): 761ms | console=4 | network=0