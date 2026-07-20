# -*- coding: utf-8 -*-
"""Generate the Centerpoint Connect redesign as separate, cross-linked HTML pages."""
import os
OUT = os.path.dirname(os.path.abspath(__file__))
IMG = "https://centerpointconnect.com/wp-content/uploads"

BADGE = ('<svg class="badge" viewBox="0 0 100 100" aria-hidden="true">'
 '<path d="M50 8a42 42 0 1 0 30 71l-14-13a23 23 0 1 1 0-32l14-13A41.8 41.8 0 0 0 50 8Z" fill="#1B4587"/>'
 '<path d="M50 92a42 42 0 0 1-30-71l14 13a23 23 0 1 0 0 32L20 79A41.8 41.8 0 0 0 50 92Z" fill="#55565C"/>'
 '<rect x="30" y="47" width="40" height="6" rx="3" fill="#fff"/>'
 '<circle cx="50" cy="50" r="6" fill="#1B4587" stroke="#fff" stroke-width="2"/></svg>')

GHOST = ('<svg class="ghost" viewBox="0 0 100 100" aria-hidden="true">'
 '<path d="M50 8a42 42 0 1 0 30 71l-14-13a23 23 0 1 1 0-32l14-13A41.8 41.8 0 0 0 50 8Z" fill="#fff"/>'
 '<path d="M50 92a42 42 0 0 1-30-71l14 13a23 23 0 1 0 0 32L20 79A41.8 41.8 0 0 0 50 92Z" fill="#fff"/></svg>')

def chk(color="#1B4587"):
    return ('<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%s" '
            'stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>' % color)

NAV_ITEMS = [
    ("Features", "#", "features", [
        ("Sales & Estimating", "sales-estimating.html"),
        ("Service Management", "service-management.html"),
        ("Production Management", "production-management.html"),
        ("Client Portal", "client-portal.html"),
        ("Integrations", "integrations.html"),
    ]),
    ("Pricing", "pricing.html", "pricing", None),
    ("Resources", "#", "resources", [
        ("Roofing Blog", "blog.html"),
        ("Affiliates", "#"),
        ("PRIN & Centerpoint", "#"),
    ]),
    ("About", "#", "about", [
        ("Our Team", "our-team.html"),
        ("Contact", "contact.html"),
    ]),
]

def header(active=""):
    items = ""
    for label, href, key, sub in NAV_ITEMS:
        cur = ' aria-current="page"' if key == active else ""
        if sub:
            caret = ' <span style="font-size:10px">&#9662;</span>'
            drop = '<ul class="dropdown">' + "".join(
                '<li><a href="%s">%s</a></li>' % (h, t) for t, h in sub) + '</ul>'
            items += '<li><a href="%s"%s>%s%s</a>%s</li>' % (href, cur, label, caret, drop)
        else:
            items += '<li><a href="%s"%s>%s</a></li>' % (href, cur, label)
    # flat mobile links
    mob = ""
    for label, href, key, sub in NAV_ITEMS:
        if sub:
            for t, h in sub:
                mob += '<li><a href="%s">%s</a></li>' % (h, t)
        else:
            mob += '<li><a href="%s">%s</a></li>' % (href, label)
    mob += '<li><a href="contact.html">Book a Demo</a></li><li><a href="#">Login</a></li>'
    return ('<header class="topbar"><div class="wrap nav">'
        '<a class="brand" href="index.html" aria-label="Centerpoint Connect home">'
        '<img class="logo" src="logo-horizontal.svg" alt="Centerpoint Connect"></a>'
        '<nav aria-label="Primary"><ul class="nav-links">' + items + '</ul></nav>'
        '<div class="nav-cta"><a class="login" href="#">Login</a>'
        '<a class="btn btn-accent" href="contact.html">Book a Demo</a></div>'
        '<button class="menu-btn" aria-label="Menu" onclick="document.getElementById(\'mm\').classList.toggle(\'open\')">&#9776;</button>'
        '</div></header>'
        '<div class="mobile-menu" id="mm"><ul>' + mob + '</ul></div>')

SF_BADGE = ('<svg class="award-badge" viewBox="0 0 120 150" xmlns="http://www.w3.org/2000/svg" role="img" '
    'aria-label="SourceForge Leader, Fall 2025">'
    '<path d="M6 8h108v98l-54 36-54-36z" fill="#c2c6cd"/>'
    '<path d="M11 13h98v90l-49 32-49-32z" fill="#ffffff"/>'
    '<path d="M11 13h98v8H11z" fill="#f47a20"/>'
    '<rect x="47" y="2" width="26" height="26" rx="6" transform="rotate(45 60 15)" fill="#f26522"/>'
    '<path d="M60 7c3 3 4 6 2 9-1 2-4 2-4 5 0 2 2 3 2 3s-6-1-6-6c0-4 4-5 6-11z" fill="#fff"/>'
    '<text x="60" y="62" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" '
    'font-size="30" fill="#231f20">Leader</text>'
    '<text x="60" y="86" text-anchor="middle" font-family="Arial, sans-serif" font-size="13" fill="#231f20">'
    '<tspan fill="#f26522">&#9733; </tspan><tspan font-weight="400">SOURCE</tspan>'
    '<tspan font-weight="800">FORGE</tspan><tspan fill="#f26522"> &#9733;</tspan></text>'
    '<path d="M20 96h80v22l-40 0-40 0z" fill="#f47a20"/>'
    '<rect x="20" y="96" width="80" height="22" fill="#f6871f"/>'
    '<text x="60" y="112" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" '
    'font-size="17" fill="#ffffff">Fall</text>'
    '<text x="60" y="135" text-anchor="middle" font-family="Arial, sans-serif" font-weight="700" '
    'font-size="13" fill="#231f20">2025</text></svg>')

FOOTER = ('<footer><div class="wrap"><div class="fgrid">'
    '<div class="fbrand">'
    '<img class="logo-footer" src="logo-horizontal.svg" alt="Centerpoint Connect">'
    '<p>All-in-one software built for commercial roofers. Centralize. Collaborate. Connect.</p>'
    '<div class="award">' + SF_BADGE + '</div></div>'
    '<div><h4>Features</h4><ul>'
    '<li><a href="sales-estimating.html">Sales &amp; Estimating</a></li>'
    '<li><a href="service-management.html">Service Management</a></li>'
    '<li><a href="production-management.html">Production Management</a></li>'
    '<li><a href="client-portal.html">Client Portal</a></li>'
    '<li><a href="integrations.html">Integrations</a></li></ul></div>'
    '<div><h4>Company</h4><ul>'
    '<li><a href="pricing.html">Pricing</a></li>'
    '<li><a href="our-team.html">Our Team</a></li>'
    '<li><a href="contact.html">Contact</a></li>'
    '<li><a href="blog.html">Roofing Blog</a></li>'
    '<li><a href="#">Contractor Login</a></li></ul></div>'
    '<div><h4>Contact</h4><ul>'
    '<li>26022 Budde Road, Suite A301<br>The Woodlands, TX 77380</li>'
    '<li>Client Support (8am&ndash;5pm)</li>'
    '<li><a href="tel:3468081560">346.808.1560</a></li>'
    '<li><a href="mailto:info@centerpointconnect.com">info@centerpointconnect.com</a></li></ul>'
    '<div class="socials" style="margin-top:16px">'
    '<a href="https://www.facebook.com/CenterpointConnect" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M13 22v-8h2.7l.4-3.1H13V8.9c0-.9.3-1.5 1.6-1.5H16V4.6c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.5H7.2V14H10v8h3z"/></svg></a>'
    '<a href="https://www.linkedin.com/company/centerpoint-connect" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.9 8.4H3.6V21h3.3V8.4zM5.2 3.2A1.94 1.94 0 1 0 5.2 7a1.94 1.94 0 0 0 0-3.8zM21 21h-3.3v-6.6c0-1.6-.6-2.6-2-2.6-1.1 0-1.7.7-2 1.4-.1.3-.1.6-.1 1V21h-3.3s.1-11.4 0-12.6h3.3v1.8c.4-.7 1.2-1.7 3-1.7 2.2 0 3.9 1.4 3.9 4.5V21z"/></svg></a>'
    '<a href="https://www.instagram.com/centerpointconnect/" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1.1" fill="currentColor" stroke="none"/></svg></a>'
    '<a href="https://www.youtube.com/@centerpointconnect248" aria-label="YouTube"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.2-.4-4.7c-.2-.8-.9-1.5-1.7-1.7C19.4 5.2 12 5.2 12 5.2s-7.4 0-8.9.4c-.8.2-1.5.9-1.7 1.7C1 8.8 1 12 1 12s0 3.2.4 4.7c.2.8.9 1.5 1.7 1.7 1.5.4 8.9.4 8.9.4s7.4 0 8.9-.4c.8-.2 1.5-.9 1.7-1.7.4-1.5.4-4.7.4-4.7zM9.8 15.2V8.8l5.5 3.2-5.5 3.2z"/></svg></a>'
    '<a href="https://www.tiktok.com/@centerpointconnect" aria-label="TikTok"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 3c.3 2 1.4 3.6 3.4 3.9v2.5c-1.2.1-2.3-.2-3.4-.8v5.4c0 3.1-2.3 5.6-5.4 5.6S5.8 19.7 5.8 16.7c0-3 2.5-5.2 5.5-4.9v2.6c-.4-.1-.8-.2-1.2-.1-1.3.1-2.2 1.2-2.1 2.5.1 1.3 1.1 2.2 2.4 2.1 1.3 0 2.2-1 2.2-2.4V3h3z"/></svg></a>'
    '</div></div>'
    '</div><div class="fbottom">'
    '<span>&copy; 2026 Centerpoint Connect. All Rights Reserved.</span>'
    '<span><a href="#">Privacy Policy</a> &nbsp;&middot;&nbsp; <a href="#">Terms of Service</a></span>'
    '</div></div></footer>')

NOTE = ('<div class="note">Redesign mockup &mdash; placeholder screenshots pull from the live site and '
        'should be replaced with final art. Logo badge is an approximation; use the official SVG.</div>')

def page(filename, title, desc, active, body, note=False):
    html = ('<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">'
        '<meta name="viewport" content="width=device-width, initial-scale=1">'
        '<title>' + title + '</title><meta name="description" content="' + desc + '">'
        '<link rel="preconnect" href="https://fonts.googleapis.com">'
        '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
        '<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">'
        '<link rel="icon" type="image/svg+xml" href="icon.svg">'
        '<link rel="stylesheet" href="styles.css"></head><body>'
        + (NOTE if note else "") + header(active) + body + FOOTER + '</body></html>')
    with open(os.path.join(OUT, filename), "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", filename, len(html), "bytes")

# ---------- shared blocks ----------
TESTIMONIALS = ('<section class="section quotes" id="customers"><div class="wrap">'
    '<div class="sec-head center"><span class="eyebrow">Trusted by the field</span>'
    '<h2>Roofers don\'t switch back.</h2></div><div class="grid">'
    '<div class="q"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
    '<p>"When we found you guys it was literally an aha moment. As soon as we attended the demo, we knew this is exactly what we needed."</p>'
    '<div class="who"><span class="av">SP</span><div><b>Sarah P.</b><small>President, Peterson Roofing</small></div></div></div>'
    '<div class="q"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
    '<p>"We had something that worked but we wanted better. We got it with Centerpoint. It improved both our sales and operations."</p>'
    '<div class="who"><span class="av">KK</span><div><b>Kevin K.</b><small>President, Mint Roofing</small></div></div></div>'
    '<div class="q"><div class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>'
    '<p>"Best roofing app on the market. After trying several commercial and residential softwares, Will and his team delivered a product that\'s easy for all users."</p>'
    '<div class="who"><span class="av">JP</span><div><b>Joe P.</b><small>President, Dennis Padula &amp; Sons</small></div></div></div>'
    '</div></div></section>')

def trust_strip():
    logos = [
        ("2025/08","Partner-Logos-roofed-right.jpg","Roofed Right"),
        ("2025/07","Partner-Logos-mint-roofing-1.jpg","Mint Roofing"),
        ("2025/07","Partner-Logos-Bulldog.jpg","Bulldog"),
        ("2025/07","Partner-Logos-encore.jpg","Encore"),
        ("2025/07","Partner-Logos-FMWalton.jpg","FM Walton"),
        ("2025/07","Partner-Logos-FSR.jpg","FSR"),
        ("2025/07","Partner-Logos-GlobalFM.jpg","Global FM"),
        ("2025/07","Partner-Logos-All-Weather.jpg","All Weather"),
        ("2025/07","Partner-Logos-pinaire.jpg","Pinaire"),
        ("2025/07","Partner-Logos-Roof-Maintenance.jpg","Roof Maintenance"),
        ("2025/07","Partner-Logos-westcoast.jpg","West Coast"),
        ("2025/07","Partner-Logos-zurix.jpg","Zurix"),
    ]
    imgs = "".join('<img src="%s/%s/%s" alt="%s" loading="lazy">' % (IMG, d, f, n) for d, f, n in logos)
    return ('<section class="trust"><div class="wrap row">'
        '<div class="stat">Trusted by <b>250+</b> roofing contractors across North America</div>'
        '<div class="logos">' + imgs + '</div></div></section>')

def final_cta():
    return ('<section class="section final" id="demo"><div class="accent"></div>'
        '<div class="wrap inner"><span class="eyebrow">Let\'s get to work</span>'
        '<h2>Make your roofing company run smoother, faster, and more profitable.</h2>'
        '<p>See Centerpoint live with a member of our team. Up and running in days, not months &mdash; with real support from real people.</p>'
        '<div class="btns"><a class="btn btn-accent" href="contact.html">Book a Live Demo</a>'
        '<a class="btn btn-ghost-light" href="pricing.html">Compare Plans &amp; Pricing</a></div></div></section>')

# ---------- product page builder ----------
def product_page(filename, title, desc, eyebrow, h1, intro, steps, imgbase):
    # stepnav
    nav = "".join('<a href="#s%d">%s</a>' % (i+1, s["nav"]) for i, s in enumerate(steps))
    stepnav = '<div class="stepnav"><div class="wrap"><div class="row">' + nav + '</div></div></div>'
    # subhero
    hero = ('<section class="subhero"><div class="dots"></div>' + GHOST +
        '<div class="wrap inner"><span class="eyebrow">' + eyebrow + '</span>'
        '<h1>' + h1 + '</h1><p>' + intro + '</p>'
        '<div class="btns"><a class="btn btn-accent" href="contact.html">Book a Live Demo</a>'
        '<a class="btn btn-ghost-light" href="pricing.html">See Pricing</a></div></div></section>')
    # steps
    rows = ""
    for i, s in enumerate(steps):
        bullets = "".join('<li>' + chk() + '<span>' + b + '</span></li>' for b in s["bullets"])
        img = s.get("img")
        media = ('<div class="media"><img src="%s/%s" alt="%s" loading="lazy" '
                 'onerror="this.style.display=\'none\';this.parentNode.querySelector(\'.fallback\').style.display=\'flex\';">'
                 '<div class="fallback" style="display:none">Product screenshot</div></div>' % (imgbase, img, s["nav"]))
        rows += ('<div class="step" id="s%d"><div class="txt"><span class="num">%d</span>'
            '<div class="label">%s</div><h2>%s</h2><p>%s</p><ul>%s</ul></div>%s</div>'
            % (i+1, i+1, s["label"], s["title"], s["body"], bullets, media))
    steps_html = '<section class="steps"><div class="wrap">' + rows + '</div></section>'
    body = hero + stepnav + steps_html + trust_strip() + TESTIMONIALS + final_cta()
    page(filename, title, desc, "features", body)

# ===== Sales & Estimating =====
product_page("sales-estimating.html",
    "Sales & Estimating | Centerpoint Connect",
    "Manage roofing sales from lead to proposal. Track leads, build estimates, and hand off jobs in one connected platform.",
    "Sales &amp; Estimating", "Track leads. Close more deals.",
    "Everything you need to turn a lead into a signed proposal &mdash; in one system built for commercial roofing.",
    [
     {"nav":"Capture Leads","label":"Step 1 &middot; Capture the Lead","title":"Track every prospect from day one","img":"2025/07/sales-estimating-1d.jpg",
      "body":"Referrals, walk-ins, web forms, or phone calls &mdash; Centerpoint keeps every lead organized from the start. Log contact info, assign reps, and monitor deal status from a centralized CRM that works in the office or the field.",
      "bullets":["Lead and opportunity tracking","Assign by rep, location, or service &mdash; 1 to 100 locations","Task reminders and automated follow-ups","Centralized client timeline with notes, files, and past jobs","Mobile CRM access for field reps"]},
     {"nav":"Qualify Job","label":"Step 2 &middot; Qualify the Job","title":"Get the right details before you quote","img":"2025/07/sales-estimating-2d.jpg",
      "body":"Send a rep to the site, log inspection details, mark problem areas, and upload photos &mdash; all from the mobile app. Inspection data stays tied to the client profile and flows straight into the estimate.",
      "bullets":["Structured inspection reporting","Annotated photo uploads","Site-specific notes stored with the lead","PDF inspection exports for internal or client use"]},
     {"nav":"Build Estimate","label":"Step 3 &middot; Build the Estimate","title":"Create accurate proposals in minutes","img":"2025/07/Desktop-screenshots-sales3.jpg",
      "body":"Using a built-in commercial roofing price book, your team builds photo-rich proposals fast &mdash; no spreadsheets, no duplicated effort. Drop in scope items, photos, disclaimers, and branded formatting in a few clicks.",
      "bullets":["Preloaded commercial price book","Drag-and-drop proposal builder","Add photos, exclusions, and payment terms","Branded PDF generation","Mobile-ready estimating from job sites"]},
     {"nav":"Send & Track","label":"Step 4 &middot; Send &amp; Track","title":"Deliver the proposal and see what happens next","img":"2025/07/sales-estimating-4d.jpg",
      "body":"Send the estimate through Centerpoint and get notified the moment your client opens it. Schedule follow-ups or trigger reminders automatically &mdash; clear visibility into where every deal stands.",
      "bullets":["One-click proposal delivery","Email open and view tracking","Automated follow-up scheduling","Convert to job with one click"]},
     {"nav":"Track Sales","label":"Step 5 &middot; Track &amp; Optimize","title":"Measure what works. Improve what doesn't.","img":"2025/07/sales-estimating-5d.jpg",
      "body":"Clear dashboards show rep performance, deal flow, conversion rates, and projected revenue &mdash; so you can double down on what's working.",
      "bullets":["Sales dashboards by rep, division, or service type","Conversion tracking and lead-source analytics","Weighted revenue forecasting","Pipeline visibility by deal stage"]},
     {"nav":"Handoff","label":"Step 6 &middot; Handoff to Production","title":"From signed proposal to active job &mdash; instantly","img":"2025/07/sales-estimating-6d.jpg",
      "body":"Once a proposal is approved, turn it into a live project in one step. Scope, pricing, photos, and notes pass straight to production &mdash; no handoff errors, no duplicate work.",
      "bullets":["One-click job conversion","All scope and files carried into production","Syncs with scheduling, dispatch, and materials","Less admin time, better communication"]},
    ], IMG)

# ===== Service Management =====
product_page("service-management.html",
    "Service Management | Centerpoint Connect",
    "Log roofing service requests, dispatch techs, capture field work, notify clients, and sync invoices in one roofing CRM.",
    "Service Management", "Less hassle. More hustle.",
    "Run a faster, more accountable service division &mdash; from the first call to the final invoice, all inside Centerpoint.",
    [
     {"nav":"Log Request","label":"Step 1 &middot; Log the Request","title":"Capture every service call &mdash; instantly","img":"2025/08/service-desktop-step1.jpg",
      "body":"Leak repair, warranty visit, or recurring inspection &mdash; every request lands on a central service board. Assign by priority, region, or client so your team sees exactly what needs attention.",
      "bullets":["Central service ticket board","Assign by technician, team, or region","Set due dates and priority flags","Attach notes, photos, or client details","All requests stored under the client record"]},
     {"nav":"Dispatch","label":"Step 2 &middot; Dispatch the Technician","title":"Send the right tech with the right info","img":"2025/08/service-desktop-step2.jpg",
      "body":"Schedule jobs by availability, location, and skill set. Techs get mobile alerts with full access to scope, directions, and files &mdash; no phone calls or paper packets.",
      "bullets":["Drag-and-drop technician scheduler","Route planning and optimization","Automatic technician notifications","Mobile access to job details and files","Real-time calendar visibility across teams"]},
     {"nav":"Complete","label":"Step 3 &middot; Complete &amp; Document","title":"Everything your techs need &mdash; in their pocket","img":"2025/08/service-desktop-step3.jpg",
      "body":"Technicians log work performed, take photos, collect signatures, and track materials from the field. Everything syncs back to the office so jobs close faster with full visibility.",
      "bullets":["Mobile field app for task logging and photos","Timekeeping linked to service tickets","Track labor, materials, and travel","Capture roof repair locations by drawing or photo","Signature capture and field completion forms"]},
     {"nav":"Review","label":"Step 4 &middot; Supervisor Review","title":"Review, verify, and approve before you bill","img":"2025/08/service-desktop-step4.jpg",
      "body":"Supervisors get full access to completed ticket details. Review labor entries, check field photos, and confirm quality before the job moves forward. Quality control, built into the workflow.",
      "bullets":["Supervisor view of ticket data, photos, and notes","Checklist for close-out compliance","Approval gates before billing triggers","Add comments or send back for revision"]},
     {"nav":"Notify","label":"Step 5 &middot; Notify the Client","title":"Keep clients in the loop &mdash; without lifting a finger","img":"2025/08/Service-Desktop-step5a.jpg",
      "body":"When work is done, Centerpoint automatically sends a job summary with before/after photos and a description of work performed. Look professional and save hours of admin.",
      "bullets":["Automated client notification emails","Job summary with embedded media","Branded message templates","Option to include PDF reports or service details"]},
     {"nav":"Invoice","label":"Step 6 &middot; Invoice &amp; Sync","title":"Get paid faster &mdash; no gaps between field and office","img":"2025/08/service-desktop-step6.jpg",
      "body":"Once reviewed and approved, the job is ready to bill. Centerpoint pulls in labor, materials, and markup and generates an invoice that syncs with QuickBooks or your ERP.",
      "bullets":["Invoicing based on ticket data","Material and labor expense capture","Profit-margin reporting on each ticket","Sync with QuickBooks and ERP tools","Payment tracking inside the client profile"]},
    ], IMG)

# ===== Production Management =====
product_page("production-management.html",
    "Production Management | Centerpoint Connect",
    "Plan jobs, assign tasks, schedule crews, and track daily progress with software built for commercial roofing teams.",
    "Production Management", "Daily progress. Zero guesswork.",
    "Centralize labor, materials, schedules, and progress &mdash; and keep every crew accountable from start to finish.",
    [
     {"nav":"Setup","label":"Step 1 &middot; Setup the Project","title":"Start strong with centralized project info","img":"2025/08/Production-Desktop-step1.jpg",
      "body":"Every job starts with a complete setup: assign crews, input scope and materials, upload documents, and define the timeline. Office or field, everyone sees the same information in one place.",
      "bullets":["Centralized project dashboard","Upload scopes, drawings, and safety docs","Assign PM, crew leads, and client contacts","Define labor and material budgets","Structure by phase, building, or task group"]},
     {"nav":"Assign Tasks","label":"Step 2 &middot; Assign Tasks","title":"Break work into tasks, not chaos","img":"2025/08/Production-Desktop-step2.jpg",
      "body":"Structure the job using task lists that mirror how your crews actually work. Assign responsibilities, link tasks to deadlines, and build workflows that guide teams from one stage to the next.",
      "bullets":["Task assignment by crew or individual","Task groups by building, phase, or area","Dependencies and sequence control","Approval steps for critical milestones","Syncs with timelines and calendars"]},
     {"nav":"Schedule","label":"Step 3 &middot; Schedule Crews &amp; Materials","title":"Balance labor, deadlines, and deliveries","img":"2025/08/Production-Desktop-step3.jpg",
      "body":"Use Gantt charts or job-queue views to plan the schedule. Coordinate material orders and crew availability across multiple jobs. Avoid overbooking and know exactly who's doing what, and when.",
      "bullets":["Gantt view with job timelines and durations","Job queue for crew workload visibility","Material tracking: ordered, received, used","Assign crews to specific days or tasks","Identify labor conflicts or overlaps"]},
     {"nav":"Track","label":"Step 4 &middot; Track Daily Progress","title":"Get real progress updates from the field","img":"2025/08/Production-Desktop-step4.jpg",
      "body":"Foremen and PMs log daily progress, photos, materials used, and percent complete from their mobile device. Updates flow to the office so you spot delays early and report with confidence.",
      "bullets":["Daily reporting forms","Percent complete by phase or task","Mobile uploads of photos and field notes","Labor-hour tracking by crew or task","Auto-timestamped entries"]},
     {"nav":"Log Delays","label":"Step 5 &middot; Log Delays &amp; Conditions","title":"Capture the realities of the jobsite","img":"2025/08/Production-Desktop-step5.jpg",
      "body":"Weather, deliveries, approvals &mdash; things change. Your field team logs delays, issues, and conditions on the fly, and every entry stays attached to the job record.",
      "bullets":["Weather logging in daily reports","Delay and event flags with notes","Track backordered materials or shutdowns","Internal comments and escalation tagging"]},
     {"nav":"Close Out","label":"Step 6 &middot; Close Out &amp; Report","title":"Wrap it up right &mdash; with oversight and insight","img":"2025/08/Production-Desktop-step6.jpg",
      "body":"At completion, all labor, materials, and documentation are reviewed. Export a job-performance report with hours, costs, and notes &mdash; and use real data to sharpen future estimates.",
      "bullets":["Job-cost tracking by labor, material, and task","Final review checklist","Daily and cumulative reporting","Exportable job-performance reports","Audit trail of updates and field activity"]},
    ], IMG)

# ===== Client Portal =====
product_page("client-portal.html",
    "Client Portal | Centerpoint Connect",
    "Give clients updates, photos, reports, and approvals in a secure portal that reduces check-ins and builds trust.",
    "Client Portal", "Manage roofs and expectations.",
    "Give clients real-time access to their jobs, documents, budgets, and communication &mdash; without extra admin from your team.",
    [
     {"nav":"Invite","label":"Step 1 &middot; Invite the Client","title":"Set up access in just a few clicks","img":"2025/08/Portal-Desktop-step1.jpg",
      "body":"Once a job or ticket is underway, grant your client access to a personalized portal. Choose what they see &mdash; budgets, documents, schedules, or photos &mdash; and let them log in from anywhere.",
      "bullets":["Portal access by job, property, or account","Permission-based visibility","Invite links emailed to the client contact","Secure login and branded interface"]},
     {"nav":"Real-Time Info","label":"Step 2 &middot; Share Real-Time Info","title":"Clients see what's happening &mdash; without calling you","img":"2025/08/Portal-Desktop-step2.jpg",
      "body":"The portal shows what matters: current job status, ticket updates, uploaded documents, and pending approvals. Clients see progress as it happens &mdash; no more status calls clogging your phone lines.",
      "bullets":["Live job and ticket status view","Milestone updates and scheduling info","Change-order visibility","Budget and approval tracking (when enabled)"]},
     {"nav":"Files & Reports","label":"Step 3 &middot; Share Files, Photos &amp; Reports","title":"Deliver documentation with a professional touch","img":"2025/08/Portal-Desktop-step3.jpg",
      "body":"Upload inspection photos, close-out reports, permits, and warranties straight to the portal. Clients download what they need &mdash; no hunting through emails or asking your office to resend.",
      "bullets":["Photo albums and galleries","PDF reports and file folders","Document version history","Branded download links"]},
     {"nav":"Approvals","label":"Step 4 &middot; Manage Approvals","title":"Get faster approvals and fewer delays","img":"2025/08/Portal-Desktop-step4.jpg",
      "body":"Need a green light on a change order, repair quote, or job phase? Clients review and approve inside the portal &mdash; keeping things moving without back-and-forth calls or emails.",
      "bullets":["Optional approval workflows for proposals and changes","E-signatures or one-click confirmations","Notifications when client action is needed","Timestamped approvals for record-keeping"]},
     {"nav":"Communicate","label":"Step 5 &middot; Transparent Communication","title":"Showcase your professionalism through clarity","img":"2025/08/Portal-Desktop-step5.jpg",
      "body":"Clients leave comments, ask questions, and respond to updates in one place. No mixed messages, no lost texts &mdash; everything stays on record and tied to the project.",
      "bullets":["Message thread attached to each job or ticket","Comment history per item or update","Office and field staff visibility","Client notifications for new messages"]},
     {"nav":"Relationships","label":"Step 6 &middot; Strengthen Relationships","title":"Build confidence with every click","img":"2025/08/Portal-Desktop-step6.jpg",
      "body":"Informed clients are confident clients &mdash; and that builds loyalty. The portal makes your company look organized, responsive, and in control, without adding work for your team.",
      "bullets":["Consistent, professional client experience","Fewer status calls and admin tasks","Self-serve access to historical projects and files","All communications and documents archived automatically"]},
    ], IMG)

print("product pages done")

# ============ HOMEPAGE ============
def bullet_check_span(t):
    return '<li>' + chk() + '<span>' + t + '</span></li>'

MOD_ICONS = {
 "sales":'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B4587" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></svg>',
 "service":'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B4587" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4l6 6-9 9-6 1 1-6z"/><path d="M12 6l6 6"/></svg>',
 "prod":'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B4587" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 4v5M8 14h8"/></svg>',
 "portal":'<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1B4587" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9 5v8l-9 5-9-5V8z"/><path d="M9 12l2 2 4-4"/></svg>',
}
def mod(icon, tag, h3, p, href):
    return ('<a class="mod" href="%s"><div class="ic">%s</div><span class="tag">%s</span>'
            '<h3>%s</h3><p>%s</p><span class="more">Learn more &rarr;</span></a>'
            % (href, MOD_ICONS[icon], tag, h3, p))

replace_rows = [
 ("CRM &amp; contact management","$99&ndash;$299"),
 ("Estimating tools","$49&ndash;$149"),
 ("Service dispatch","$99&ndash;$199"),
 ("Time tracking","$20&ndash;$50"),
 ("File &amp; photo management","$99&ndash;$300"),
 ("Digital signatures","$29&ndash;$99"),
 ("Reporting &amp; dashboards","$50&ndash;$200"),
 ("Client portal &amp; project mgmt","$49&ndash;$99"),
]
rtable_body = "".join('<tr><td>%s</td><td class="cost">%s</td><td class="chk">%s</td></tr>' % (n,c,chk()) for n,c in replace_rows)

HOME = ('<section class="hero"><div class="dots"></div>'
 '<div class="wrap grid"><div>'
 '<span class="eyebrow">Built for the boots on the roof</span>'
 '<h1>All-in-one software built for <span class="u">commercial roofers.</span></h1>'
 '<p class="sub">Stop stitching together a CRM, estimating tool, dispatch system, and client portal. '
 'Centerpoint connects every part of your business &mdash; from first lead to final invoice &mdash; in one platform.</p>'
 '<div class="hero-cta"><a class="btn btn-accent" href="contact.html">Book a Live Demo</a>'
 '<a class="btn btn-ghost-light" href="pricing.html">Compare Plans &amp; Pricing</a></div>'
 '<div class="hero-checks"><span>&#10003; Up and running in days, not months</span>'
 '<span>&#10003; No recurring annual fees</span><span>&#10003; Cancel anytime</span></div>'
 '<div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap;margin-top:22px">'
 '<a class="play-link" href="https://youtu.be/0pL8X0j9f_U" target="_blank" rel="noopener">'
 '<span class="pl"><svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M8 5v14l11-7z"/></svg></span>'
 'Watch the overview</a>'
 '<div class="tagline" style="margin-top:0">Centralize. Collaborate. Connect.</div></div></div>'
 '<div class="hero-visual"><img src="' + IMG + '/2025/08/Centrepoint-Home-Phones.png" '
 'alt="Centerpoint Connect on mobile and desktop" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\';">'
 '<div class="fallback" style="display:none">Product screenshots<br>(mobile + desktop app)</div></div></div></section>'
 + trust_strip() +
 '<section class="section modules" id="modules"><div class="wrap">'
 '<div class="sec-head center"><span class="eyebrow">One system, every department</span>'
 '<h2>From sales to invoicing. We got you.</h2>'
 '<p>From lead to invoice, Centerpoint connects your team, eliminates tech bloat, and cuts costs &mdash; '
 'with minimal setup and a preloaded commercial roofing price book.</p></div><div class="mod-grid">'
 + mod("sales","Sales &amp; Estimating","Track leads. Close more deals.","Run your whole sales process on one screen &mdash; lead capture, photo-rich proposals, and follow-ups. Bid faster and close jobs sooner.","sales-estimating.html")
 + mod("service","Service Management","Less hassle. More hustle.","Dispatch crews, assign work orders, and track requests from any phone or tablet. Cut the paperwork and keep every job on time.","service-management.html")
 + mod("prod","Production Management","Daily progress. Zero guesswork.","Watch projects move in real time. Capture photos, assign tasks, and update budgets in the field &mdash; everyone aligned and billable.","production-management.html")
 + mod("portal","Client Portal","Manage roofs and expectations.","Give clients a secure portal for inspections, proposals, progress, and reports. Transparency builds trust and gets you paid faster.","client-portal.html")
 + '</div></div></section>'
 + '<section class="section replace" id="replace"><div class="dots"></div><div class="wrap inner"><div>'
 '<span class="eyebrow">What Centerpoint replaces</span>'
 '<h2>One platform instead of ten subscriptions.</h2>'
 '<p>Stop juggling CRMs, estimating tools, dispatch systems, time tracking, and portals. Centerpoint brings them '
 'together in one roofing-specific platform, so your team works smarter without the tech overload.</p>'
 '<div class="value-badge"><small>Total replaced monthly value</small><div class="amt">$1,500&ndash;$2,000+</div></div>'
 '<div style="margin-top:26px"><a class="btn btn-accent" href="contact.html">Book a Live Demo</a></div></div>'
 '<div class="rtable"><table><thead><tr><th>What you\'re paying for</th><th>Typical monthly cost</th><th class="chk">In CPC</th></tr></thead>'
 '<tbody>' + rtable_body + '</tbody>'
 '<tfoot><tr><td>Replaced by Centerpoint</td><td class="cost">$1,500&ndash;$2,000+</td><td class="chk">&#9733;</td></tr></tfoot>'
 '</table></div></div></section>'
 + '<section class="section compare"><div class="wrap"><div class="sec-head center">'
 '<span class="eyebrow">Thinking about switching?</span>'
 '<h2>Built for commercial roofing &mdash; not retrofitted for it.</h2>'
 '<p>Moving off Jobba, Dataforma, or ServiceTitan? Here\'s where Centerpoint pulls ahead.</p></div>'
 '<div class="grid">'
 '<div class="cmp"><span class="vs">vs ServiceTitan</span><h3>Roofing-native, not generic trades</h3>'
 '<ul><li>&#10003; Built-in roofing materials &amp; libraries</li><li>&#10003; Client portal with budgeting</li><li>&#10003; True offline iOS &amp; Android apps</li></ul></div>'
 '<div class="cmp"><span class="vs">vs Dataforma</span><h3>Modern, mobile, and connected</h3>'
 '<ul><li>&#10003; Offline field apps for every crew</li><li>&#10003; Connected historical data exports</li><li>&#10003; Photo-rich proposals in minutes</li></ul></div>'
 '<div class="cmp"><span class="vs">vs Jobba</span><h3>One system, fully integrated</h3>'
 '<ul><li>&#10003; QuickBooks / ERP integration</li><li>&#10003; Client portal with budgeting</li><li>&#10003; Commercial-roofing focused</li></ul></div>'
 '</div><div class="center" style="margin-top:34px"><a class="btn btn-ghost" href="pricing.html">See the full comparison &rarr;</a></div></div></section>'
 + '<section class="section two"><div class="wrap"><div class="sec-head center">'
 '<span class="eyebrow">Why Centerpoint Connect?</span><h2>Built for two types of contractors.</h2></div>'
 '<div class="cols"><div class="card2"><div class="k">You\'re already using software&hellip;</div>'
 '<ul><li>&#8226; But it wasn\'t built for commercial roofing</li><li>&#8226; You\'re stitching together too many apps</li><li>&#8226; Your team hates using it</li></ul></div>'
 '<div class="card2"><div class="k">You\'re using nothing at all&hellip;</div>'
 '<ul><li>&#8226; You\'re running on whiteboards and text threads</li><li>&#8226; Paperwork is scattered everywhere</li><li>&#8226; You\'re growing &mdash; but disorganized</li></ul></div></div>'
 '<p class="payoff">Centerpoint is built for you &mdash; either way.</p></div></section>'
 + TESTIMONIALS
 + '<section class="section pricing" id="pricing"><div class="wrap"><div class="sec-head center">'
 '<span class="eyebrow">Transparent, scalable pricing</span><h2>Start where you are. Scale as you grow.</h2>'
 '<p>Pick the tools you need today and add modules as you expand. One login, no annual lock-in.</p></div>'
 '<div class="plans">'
 '<div class="plan"><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Sell It</div><div class="pd">The Essentials CRM</div><div class="pp">$1,999<span>one-time setup</span></div></div>'
 '<div class="plan"><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Service It</div><div class="pd">Service Tools</div><div class="pp">$999<span>one-time setup</span></div></div>'
 '<div class="plan"><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Produce It</div><div class="pd">Production Tools</div><div class="pp">$999<span>one-time setup</span></div></div>'
 '<div class="plan feat"><span class="ribbon">Most Complete</span><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Scale It</div><div class="pd">Everything, connected</div><div class="pp">$7,499<span>one-time setup</span></div></div>'
 '</div><p class="price-note">Monthly user fees: <b>$50/mo</b> field users &middot; <b>$100/mo</b> admin users. Enterprise &amp; multi-location plans available.</p>'
 '<div class="center" style="margin-top:24px"><a class="btn btn-primary" href="pricing.html">Compare Plans &amp; Pricing</a></div></div></section>'
 + final_cta())
page("index.html", "Roofing CRM Software | Centerpoint Connect",
     "All-in-one software built for commercial roofers. Centerpoint connects every part of your business, from lead to invoice, in one platform.",
     "", HOME)

# ============ PRICING ============
plan_cards = (
 '<div class="plan"><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Sell It</div><div class="pd">The Essentials CRM</div>'
 '<div class="pp">$1,999<span>one-time implementation</span></div><a class="btn btn-ghost" href="contact.html">Get Started</a></div>'
 '<div class="plan"><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Service It</div><div class="pd">Service Tools</div>'
 '<div class="pp">$999<span>one-time implementation</span></div><a class="btn btn-ghost" href="contact.html">Get Started</a></div>'
 '<div class="plan"><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Produce It</div><div class="pd">Production Tools</div>'
 '<div class="pp">$999<span>one-time implementation</span></div><a class="btn btn-ghost" href="contact.html">Get Started</a></div>'
 '<div class="plan feat"><span class="ribbon">Most Complete</span><div class="plan-icon" aria-hidden="true">Icon</div><div class="pk">Scale It</div><div class="pd">Everything, connected</div>'
 '<div class="pp">$7,499<span>one-time implementation</span></div><a class="btn btn-accent" href="contact.html">Book a Demo</a></div>')

matrix = [
 ("Roofing CRM",[1,0,0,1,1]),("Lead &amp; Opportunity Tracking",[1,0,0,1,1]),
 ("Proposal Builder &amp; Estimating",[1,0,0,1,1]),("File &amp; Photo Library",[1,0,0,1,1]),
 ("Sales / Lead Reporting",[1,0,0,1,1]),("Roof Inspections",[1,0,0,1,1]),
 ("Repair Quotes",[1,0,0,1,1]),("Mobile App",[1,0,0,1,1]),("Client Portal",[1,0,0,1,1]),
 ("Quick Pics",[1,1,1,1,1]),("Service Ticket Board",[0,1,0,1,1]),
 ("Service Technician Mobile App",[0,1,0,1,1]),("Service Approvals &amp; Invoicing",[0,1,0,1,1]),
 ("Warranties",[0,1,0,1,1]),("Service Agreements",[0,1,0,1,1]),
 ("Production Board",[0,0,1,1,1]),("Daily Progress Reporting",[0,0,1,1,1]),
 ("Budgeting &amp; Job Cost Tracking",[0,0,1,1,1]),("Progress Billing",[0,0,0,1,1]),
 ("Custom Workflow Stages",[0,0,0,1,1]),("Zapier Integrations / Automations",[0,0,0,1,1]),
 ("Multiple Locations",[0,0,0,0,1]),("Production Estimating <small>(add\'l implementation fee)</small>",[0,0,0,0,1]),
 ("API Access <small>(add\'l monthly fee)</small>",[0,0,0,0,1]),
 ("Custom Export Templates <small>(add\'l fee)</small>",[0,0,0,0,1]),
 ("Custom Integrations <small>(add\'l fee)</small>",[0,0,0,0,1]),
]
def cell(v, feat=False):
    c = ' class="feat-col"' if feat else ''
    inner = '<span class="yes">%s</span>' % chk() if v else '<span style="color:#c9ccd4">&mdash;</span>'
    return '<td%s>%s</td>' % (c, inner)
mrows = ""
for name, vals in matrix:
    tds = "".join(cell(vals[i], feat=(i==3)) for i in range(5))
    mrows += '<tr><th>%s</th>%s</tr>' % (name, tds)
impl = ['$1,999','$999','$999','$7,499','Ask for Pricing']
impl_tds = "".join('<td%s>%s</td>' % (' class="feat-col"' if i==3 else '', impl[i]) for i in range(5))

comp_rows = [
 ("Commercial roofing focused",["y","n","y","y"]),
 ("Built-in roofing materials &amp; libraries",["y","n","w","n"]),
 ("Client portal with budgeting",["y","n","y","w"]),
 ("Offline iOS &amp; Android apps",["y","n","w","n"]),
 ("QuickBooks / ERP integration",["y","w","y","n"]),
 ("Connected historical data exports",["y","w","n","n"]),
]
def mark(m):
    if m=="y": return '<span class="yes">'+chk()+'</span>'
    if m=="n": return '<span style="color:#c26">&#10007;</span>'
    return '<span style="color:#FFA726;font-weight:700">&#9888;</span>'
crows = ""
for name, ms in comp_rows:
    crows += ('<tr><th>%s</th><td class="cp">%s</td><td>%s</td><td>%s</td><td>%s</td></tr>'
              % (name, mark(ms[0]), mark(ms[1]), mark(ms[2]), mark(ms[3])))

PRICING = ('<section class="subhero"><div class="dots"></div>' + GHOST +
 '<div class="wrap inner"><span class="eyebrow">Pricing</span>'
 '<h1>Transparent, scalable pricing that grows with you.</h1>'
 '<p>One platform. One login. One simple decision that replaces thousands in monthly software costs. '
 'Pay once to implement, then simple per-user monthly fees &mdash; no annual lock-in.</p>'
 '<div class="btns"><a class="btn btn-accent" href="contact.html">Book a Live Demo</a></div></div></section>'
 + '<section class="section pricing"><div class="wrap"><div class="sec-head center">'
 '<span class="eyebrow">Choose your starting point</span><h2>Plans that match how you work.</h2>'
 '<p>Start with one department or run the whole business on Scale It. Add modules any time.</p></div>'
 '<div class="plans">' + plan_cards + '</div>'
 '<p class="price-note">Monthly user fees: <b>$50/mo</b> per field user &middot; <b>$100/mo</b> per admin user. '
 'Enterprise adds multiple locations, API access, production estimating, and custom integrations &mdash; ask for pricing.</p>'
 '</div></section>'
 + '<section class="section"><div class="wrap"><div class="sec-head center">'
 '<span class="eyebrow">Full feature comparison</span><h2>Everything included, plan by plan.</h2></div>'
 '<div class="ptable"><table><thead><tr><th style="text-align:left">Feature</th>'
 '<th>Sell It<small>Essentials CRM</small></th><th>Service It<small>Service Tools</small></th>'
 '<th>Produce It<small>Production Tools</small></th><th class="feat-col">Scale It<small>Everything</small></th>'
 '<th>Enterprise<small>Multi-location</small></th></tr></thead><tbody>' + mrows + '</tbody>'
 '<tfoot><tr><th>Implementation (one-time)</th>' + impl_tds + '</tr></tfoot></table></div>'
 '<p class="price-note">Monthly user fees are $50/month for field users and $100/month for admin users.</p></div></section>'
 + '<section class="section" style="background:var(--off-white)"><div class="wrap"><div class="sec-head center">'
 '<span class="eyebrow">Thinking about switching?</span>'
 '<h2>See how Centerpoint compares.</h2>'
 '<p>Here\'s how we stack up against Jobba, Dataforma, and ServiceTitan &mdash; and why more roofing companies are making the move.</p></div>'
 '<div class="vs-table"><table><thead><tr><th style="text-align:left">Capability</th>'
 '<th class="cp">Centerpoint</th><th>ServiceTitan</th><th>Dataforma</th><th>Jobba</th></tr></thead>'
 '<tbody>' + crows + '</tbody></table></div>'
 '<p class="price-note">&#10003; Included &nbsp;&middot;&nbsp; &#9888; Limited / partial &nbsp;&middot;&nbsp; &#10007; Not available</p>'
 '</div></section>'
 + final_cta())
page("pricing.html", "Pricing & Plans | Centerpoint Connect",
     "Clear pricing and flexible plans for roofing CRM software. Find the plan that fits your business and manage every project with ease.",
     "pricing", PRICING)

# ============ INTEGRATIONS ============
direct = [
 ("Accounting &amp; ERP","Acumatica","Automatically feed invoices directly in, with the option of project tasks."),
 ("Accounting &amp; ERP","QuickBooks Online","Sync clients, projects, service tickets, labor, materials, invoices, and payments."),
 ("Accounting &amp; ERP","QuickBooks Desktop","Sync customers, jobs, and invoices with QuickBooks Desktop."),
 ("Accounting &amp; ERP","Spectrum","Real-time sync of service and sales data for better accounting and oversight."),
 ("Accounting &amp; ERP","Vista","Sync service invoices in real time, right when you\'re ready to send."),
 ("Accounting &amp; ERP","Sage Intacct","Streamline accounting, financial reporting, invoicing, and project financials."),
 ("Accounting &amp; ERP","Explorer","Keep projects, teams, and finances in sync &mdash; on time and on budget."),
 ("Automation &amp; Workflow","Zapier","Automate alerts, lead creation, reporting and more &mdash; connect Gmail, Sheets, HubSpot and beyond."),
 ("Automation &amp; Workflow","Mindcloud","Move data between Centerpoint and the systems your team already relies on."),
 ("Developer &amp; Custom","REST API","Integrate with proprietary systems, BI tools, dashboards, and custom workflows."),
]
limited = [
 ("Sage 300","Cloud finance and multi-entity support &mdash; billing, receivables, and payables."),
 ("Foundation Software","Batch import/export for invoicing, vendor payments, and financial reporting."),
 ("Spectrum (batch)","Batch export/import files for invoicing, timekeeping, and materials."),
 ("QuickBooks Online (payroll)","Batch-enter payroll in QuickBooks Online Advanced to save time."),
 ("ComputerEase","Batch-process service invoices, custom-fit to your CE setup."),
]
soon = [("Time Management","Google Calendar"),("Time Management","Outlook Calendar"),
        ("File & Document","Dropbox"),("File & Document","Google Drive"),
        ("File & Document","OneDrive"),("Artificial Intelligence","AI Assist")]

direct_cards = "".join('<div class="intg"><div class="cat">%s</div><h4>%s</h4><p>%s</p></div>' % (c,n,d) for c,n,d in direct)
limited_cards = "".join('<div class="intg"><div class="cat">Accounting &amp; ERP</div><h4>%s</h4><p>%s</p></div>' % (n,d) for n,d in limited)
soon_cards = "".join('<div class="intg-soon"><div class="cat">%s</div><h4>%s</h4></div>' % (c,n) for c,n in soon)

INTG = ('<section class="subhero"><div class="dots"></div>' + GHOST +
 '<div class="wrap inner"><span class="eyebrow">Integrations</span>'
 '<h1>Powerful integrations, seamless sync.</h1>'
 '<p>Centerpoint was built to reduce software bloat &mdash; but we know there are tools you still need. '
 'We offer clean, stable connections to your most important platforms across accounting, automation, '
 'file storage, and more, so everything keeps talking.</p>'
 '<div class="btns"><a class="btn btn-accent" href="contact.html">Talk to Our Team</a></div></div></section>'
 + '<section class="section"><div class="wrap">'
 '<div class="intg-group"><div class="gh"><h3>Direct integrations</h3><span class="pill">Live now</span></div>'
 '<div class="intg-grid">' + direct_cards + '</div></div>'
 '<div class="intg-group"><div class="gh"><h3>Limited / batch integrations</h3><span class="pill">Batch sync</span></div>'
 '<div class="intg-grid">' + limited_cards + '</div></div>'
 '<div class="intg-group"><div class="gh"><h3>Coming soon</h3><span class="pill soon">In progress</span></div>'
 '<div class="intg-soon-grid">' + soon_cards + '</div></div>'
 '<div class="card2" style="margin-top:44px;border-top-color:var(--orange)"><div class="k">Need a custom integration?</div>'
 '<p style="font-size:15px">Centerpoint supports custom builds for proprietary systems, reporting tools, dashboards, '
 'and unique workflows. If your business relies on a system that isn\'t listed here, our team can help explore a '
 'custom connection. Clean connections, no code needed, and no more jumping between disconnected platforms.</p>'
 '<div style="margin-top:18px"><a class="btn btn-primary" href="contact.html">Request a Custom Integration</a></div></div>'
 '</div></section>'
 + trust_strip() + final_cta())
page("integrations.html", "Integrations | Centerpoint Connect",
     "Connect the tools you already use with Centerpoint Connect. Clean, reliable roofing software integrations that keep every workflow in sync.",
     "features", INTG)

# ============ OUR TEAM ============
TEAM_BASE = IMG + "/2026/07/"
team = [
 ("CEO","Will Riley","Will-Riley.jpg","will.riley@centerpointconnect.com"),
 ("COO","Kristin Jones","Kristin.jpg","kristin.jones@centerpointconnect.com"),
 ("CEO &amp; Partner","Darren Gardner","Darren.jpg",""),
 ("Marketing Director","Tom Macauley","Tom.jpg","thomasmacauley@live.com"),
 ("Director of Client Success","Ben Hornbeck","Ben2.jpg","ben.hornbeck@centerpointconnect.com"),
 ("Client Success &amp; Onboarding","Dylan McDonald","Dylan2.jpg","dylan.mcdonald@centerpointconnect.com"),
 ("Client Development Specialist","Quincy Riley","Quincy2.jpg","quincy.riley@centerpointconnect.com"),
 ("Account Executive","Jake Scimeca","Jake.jpg","jake.scimeca@centerpointconnect.com"),
 ("Account Manager","Shane Jones","Shane.jpg","shane.jones@centerpointconnect.com"),
 ("Customer Support Specialist","Carie Shorter","Carie.jpg","carie.shorter@centerpointconnect.com"),
 ("Full-Stack Developer","Jyotsna Agrawal","Jyotsna.jpg","jyotsna.agrawal@centerpointconnect.com"),
 ("Data &amp; Automation Engineer","Austin Bass","Austin2.jpg","austin.bass@centerpointconnect.com"),
 ("QA Engineer","Yousaf Afaq","Yousaf.jpg","yousaf.afaq@centerpointconnect.com"),
 ("Cybersecurity Intern","Anisha Menezes","Anisha2.jpg","anisha.menezes@centerpointconnect.com"),
]
def initials(name):
    parts = name.replace("&amp;","").split()
    return (parts[0][0] + (parts[-1][0] if len(parts)>1 else "")).upper()
members = ""
for role, name, photo, email in team:
    mail = ('<a href="mailto:%s">%s</a>' % (email, email)) if email else ''
    members += ('<div class="member"><div class="ph"><span>%s</span>'
        '<img src="%s%s" alt="%s" loading="lazy" onerror="this.style.display=\'none\'"></div>'
        '<div class="info"><div class="role">%s</div><h3>%s</h3>%s</div></div>'
        % (initials(name), TEAM_BASE, photo, name, role, name, mail))

TEAMPG = ('<section class="subhero"><div class="dots"></div>' + GHOST +
 '<div class="wrap inner"><span class="eyebrow">About us</span>'
 '<h1>The team behind the platform.</h1>'
 '<p>We work like we wear the toolbelt. From roofing veterans to engineers and client-success pros, '
 'our team builds and supports Centerpoint with the roofer in mind &mdash; every feature, every update, every decision.</p>'
 '</div></section>'
 + '<section class="section"><div class="wrap"><div class="team-grid">' + members + '</div></div></section>'
 + '<section class="section two"><div class="wrap"><div class="sec-head center">'
 '<span class="eyebrow">What drives us</span><h2>Our core values.</h2></div>'
 '<div class="cols" style="grid-template-columns:repeat(3,1fr)">'
 '<div class="card2"><div class="k">Walk in the boots</div><p style="font-size:15px">Real solutions come from understanding the job from the ground up &mdash; not from a boardroom.</p></div>'
 '<div class="card2"><div class="k">A better way</div><p style="font-size:15px">There\'s always a smarter path. We never rebuild the old way when a faster, more efficient approach exists.</p></div>'
 '<div class="card2"><div class="k">Radical support</div><p style="font-size:15px">Fast, human, and genuinely invested in your success. Real progress happens when no one is left behind.</p></div>'
 '</div></div></section>'
 + final_cta())
page("our-team.html", "Our Team | Centerpoint Connect",
     "Meet the team behind Centerpoint Connect &mdash; roofing veterans, engineers, and client-success pros building software for commercial roofers.",
     "about", TEAMPG)

# ============ CONTACT ============
CONTACT = ('<section class="subhero"><div class="dots"></div>' + GHOST +
 '<div class="wrap inner"><span class="eyebrow">Contact</span>'
 '<h1>Let\'s make your roofing company run smoother.</h1>'
 '<p>Book a live demo or send us a note. We\'ll show you how Centerpoint connects your whole operation &mdash; '
 'and answer every question along the way.</p></div></section>'
 + '<section class="section"><div class="wrap"><div class="contact-grid">'
 '<div class="contact-info">'
 '<div class="block"><div class="k">Book a live demo</div><p>See the platform in action with a member of our team. '
 'Up and running in days, not months.</p></div>'
 '<div class="block"><div class="k">Call us</div><a href="tel:3468081560">346.808.1560</a><p style="font-size:14px;color:var(--ash)">Client support 8:00am&ndash;5:00pm CT</p></div>'
 '<div class="block"><div class="k">Email</div><a href="mailto:info@centerpointconnect.com">info@centerpointconnect.com</a></div>'
 '<div class="block"><div class="k">Visit</div><p>26022 Budde Road, Suite A301<br>The Woodlands, TX 77380</p></div>'
 '<div class="block"><div class="k">Existing customer?</div><p><a href="#">Log in to your account &rarr;</a></p></div>'
 '<div class="map">Map &mdash; The Woodlands, TX</div>'
 '</div>'
 '<form class="cform" onsubmit="event.preventDefault();this.querySelector(\'.done\').style.display=\'block\';">'
 '<h3 style="font-size:22px;margin-bottom:6px">Request a demo</h3>'
 '<p style="font-size:14px;color:var(--ash);margin-bottom:6px">Tell us about your roofing business.</p>'
 '<label for="cn">Full name</label><input id="cn" name="name" type="text" placeholder="Your name" required>'
 '<label for="cc">Company</label><input id="cc" name="company" type="text" placeholder="Company name" required>'
 '<label for="ce">Work email</label><input id="ce" name="email" type="email" placeholder="you@company.com" required>'
 '<label for="cp">Phone</label><input id="cp" name="phone" type="tel" placeholder="(000) 000-0000">'
 '<label for="cs">Team size</label><select id="cs" name="size"><option>1&ndash;5</option><option>6&ndash;20</option><option>21&ndash;50</option><option>51+</option></select>'
 '<label for="cm">What are you hoping to solve?</label><textarea id="cm" name="message" rows="4" placeholder="Tell us a bit about your current setup"></textarea>'
 '<button class="btn btn-accent" type="submit">Book My Demo</button>'
 '<p class="done" style="display:none;margin-top:14px;color:var(--cp-blue);font-weight:600">Thanks! This is a demo form &mdash; wire it to your CRM or Jotform before launch.</p>'
 '</form></div></div></section>'
 + trust_strip())
page("contact.html", "Contact | Centerpoint Connect",
     "Book a live demo or contact Centerpoint Connect. See how all-in-one roofing software connects your whole operation.",
     "about", CONTACT)

# ============ BLOG ============
featured = {
 "cat":"News &amp; Updates","date":"July 8, 2026",
 "title":"Centerpoint Connect Wins the Spring 2026 Top Performer Award from SourceForge",
 "excerpt":"We\'re proud to announce that Centerpoint Connect has been recognized as a Spring 2026 Top Performer by SourceForge, the world\'s largest software reviews and comparison platform &mdash; a reflection of the results our roofing customers see every day.",
 "img":IMG + "/2026/07/sourceforge-top-performer-award-centerpoint-connect.png",
}
posts = [
 ("Client Relationships","June 23, 2026","How to Follow Up With Roofing Leads Without Annoying Them",
  "Most roofing sales don\'t die because the price was too high. They die in silence after the proposal goes out. Here\'s how to follow up in a way that wins the job.",
  IMG + "/2026/06/how-to-follow-up-with-roofing-leads-without-annoying-them.png"),
 ("Technology","June 9, 2026","Will Your Roofing Crews Actually Use New Software?",
  "It\'s the question every contractor is really asking before they book a demo or switch platforms. Adoption &mdash; not features &mdash; is what makes or breaks a rollout.",
  IMG + "/2026/06/roofing-crew-software-adoption.png"),
 ("Selling Skills","May 25, 2026","Roof Inspection to Signed Contract: Closing the Gap That Loses You Deals",
  "You finished the inspection, documented the damage, and shook hands on the way out. Then the deal went quiet. Here\'s how to close the gap between inspection and contract.",
  IMG + "/2026/05/commercial-roof-inspection-to-contract-workflow.png"),
 ("Business","May 8, 2026","Why Your Roofing Crew Hates Your Software",
  "If you rolled out a new app and were met with silence &mdash; or watched your crew drift back to paper &mdash; the problem usually isn\'t your team. It\'s the tool.",
  IMG + "/2026/05/why-your-roofing-crew-hates-your-software.png"),
 ("Guides","April 21, 2026","Roofing Software Demo Guide: 10 Questions to Ask Before You Choose",
  "A demo is more than a product walkthrough. It\'s your chance to see how the system fits your day-to-day. Ask these ten questions before you commit.",
  IMG + "/2026/04/roofing-demo-guide-questions.jpg"),
 ("Guides","April 6, 2026","Roofing Software Pricing Explained: Understanding Cost and Value",
  "One platform charges by user, another by feature, others add costs for integrations and onboarding. Here\'s how to compare roofing software pricing apples-to-apples.",
  IMG + "/2026/04/Roofing-Software-Pricing-Explained.jpg"),
 ("Technology","March 23, 2026","Beyond Contacts: How Roofing CRMs Drive Production Visibility and Profitability",
  "For many companies a CRM is still just a sales tool. The right roofing CRM does far more &mdash; connecting production visibility directly to profitability.",
  IMG + "/2026/03/roofing-CRM-drive-production-visibility-profitability-scaled.jpg"),
 ("Business","March 9, 2026","Service Divisions and Digital Dispatch: Turning Repairs Into Recurring Revenue",
  "For many roofers, service work happens reactively. With digital dispatch and a real service division, those one-off repairs become predictable, recurring revenue.",
  IMG + "/2026/03/Background.jpg"),
]
cats = []
for p in [ (featured["cat"],) ] + [(c,) for c,_,_,_,_ in posts]:
    if p[0] not in cats: cats.append(p[0])
chips = '<button class="chip active" data-cat="all" onclick="filterBlog(this,\'all\')">All</button>'
chips += "".join('<button class="chip" data-cat="%s" onclick="filterBlog(this,\'%s\')">%s</button>'
                 % (c, c, c) for c in cats)

def blog_img(src, alt):
    return ('<div class="img"><img src="%s" alt="%s" loading="lazy" '
            'onerror="this.style.display=\'none\'"></div>' % (src, alt))

feat_html = ('<div class="featured">' + blog_img(featured["img"], featured["title"]) +
 '<div class="body"><div class="flag">Featured &middot; ' + featured["cat"] + '</div>'
 '<h2>' + featured["title"] + '</h2><p>' + featured["excerpt"] + '</p>'
 '<div class="meta">' + featured["date"] + '</div>'
 '<a class="btn btn-primary" href="blog-post.html">Read the Article</a></div></div>')

cards = ""
for cat, date, title, excerpt, img in posts:
    cards += ('<article class="bcard" data-cat="' + cat + '">' + blog_img(img, title) +
      '<div class="body"><span class="cat">' + cat + '</span>'
      '<h3><a href="blog-post.html">' + title + '</a></h3><p>' + excerpt + '</p>'
      '<div class="meta"><span>' + date + '</span><a href="blog-post.html">Read more &rarr;</a></div></div></article>')

BLOG_JS = ('<script>function filterBlog(btn,cat){'
 'document.querySelectorAll(".chip").forEach(function(c){c.classList.remove("active")});btn.classList.add("active");'
 'document.querySelectorAll(".bcard").forEach(function(card){'
 'card.classList.toggle("hidden",cat!=="all"&&card.dataset.cat!==cat)});}</script>')

BLOG = ('<section class="subhero"><div class="dots"></div>' + GHOST +
 '<div class="wrap inner"><span class="eyebrow">Roofing Blog</span>'
 '<h1>Insights to grow your roofing business.</h1>'
 '<p>Real tips, tech trends, and best practices for commercial roofing &mdash; from sales and service to '
 'production and technology. No fluff, just what works in the field.</p></div></section>'
 + '<section class="section"><div class="wrap">'
 '<div class="sec-head center" style="margin-bottom:26px"><span class="eyebrow">Latest posts</span>'
 '<h2>From the Centerpoint team.</h2></div>'
 '<div class="blog-filter">' + chips + '</div>'
 + feat_html
 + '<div class="blog-grid">' + cards + '</div>'
 '<div class="blog-pager"><a class="active" href="#">1</a><a href="#">2</a><a href="#">3</a>'
 '<a href="#">&hellip;</a><a href="#">5</a><a href="#">Next &raquo;</a></div>'
 '</div></section>'
 + '<section class="section news-band"><div class="wrap"><div class="inner">'
 '<div class="dots" style="position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.1) 1.2px,transparent 1.2px);background-size:22px 22px;opacity:.5"></div>'
 '<div style="position:relative"><span class="eyebrow">Stay in the loop</span>'
 '<h2>Roofing insights, straight to your inbox.</h2>'
 '<p>Get new articles and product updates a few times a month. No spam &mdash; unsubscribe anytime.</p>'
 '<form class="news-form" onsubmit="event.preventDefault();this.querySelector(\'input\').value=\'\';this.querySelector(\'.btn\').textContent=\'Subscribed!\';">'
 '<input type="email" placeholder="you@company.com" required>'
 '<button class="btn btn-accent" type="submit">Subscribe</button></form></div></div></div></section>'
 + final_cta() + BLOG_JS)
page("blog.html", "Roofing Blog for Contractors | Centerpoint Connect",
     "Grow your roofing business with insights from Centerpoint Connect. Real tips, tech trends, and best practices for commercial roofing.",
     "resources", BLOG)

# ============ BLOG POST TEMPLATE (single article) ============
# Reusable layout. Duplicate this page per article and swap the fields below.
ART = {
 "cat":"Client Relationships",
 "title":"How to Follow Up With Roofing Leads Without Annoying Them",
 "author":"Ben Hornbeck","author_role":"Director of Client Success",
 "date":"June 23, 2026","read":"5 min read",
 "img":IMG + "/2026/06/how-to-follow-up-with-roofing-leads-without-annoying-them.png",
}
def av_initials(n):
    p=n.split(); return (p[0][0]+p[-1][0]).upper()

ARTICLE_BODY = (
 '<p>Most roofing sales don\'t die because the price was too high or the proposal wasn\'t good enough. '
 'They die in silence &mdash; after the proposal goes out and the follow-up never happens. The building '
 'owner gets busy, another contractor stays top of mind, and the job you inspected quietly goes to '
 'someone else.</p>'
 '<p>The fix isn\'t more aggressive selling. It\'s a <strong>consistent, respectful follow-up system</strong> '
 'that keeps you in front of the prospect without making them dread your name on the caller ID. Here\'s how to build one.</p>'
 '<h2>Why good leads go cold</h2>'
 '<p>Commercial roofing decisions rarely happen on the first conversation. Owners and facility managers '
 'are weighing budgets, board approvals, and competing bids. When you stop following up after one or two '
 'tries, you\'re not being polite &mdash; you\'re handing the job to whoever stayed in the conversation longer.</p>'
 '<blockquote><p>Roughly 80% of sales require five or more follow-ups. Most reps stop after two.</p></blockquote>'
 '<h2>Build a follow-up cadence that respects their time</h2>'
 '<p>The goal is to be helpful and present, not repetitive. A simple cadence after the proposal goes out '
 'might look like this:</p>'
 '<ul>'
 '<li><strong>Day 1:</strong> Send the proposal with a short, specific summary of what you saw on the roof.</li>'
 '<li><strong>Day 3:</strong> A quick check-in &mdash; confirm they received it and offer to walk through any questions.</li>'
 '<li><strong>Day 7:</strong> Add value. Share a relevant photo, a warranty detail, or a note about seasonal timing.</li>'
 '<li><strong>Day 14:</strong> A soft deadline &mdash; mention scheduling or material lead times honestly.</li>'
 '<li><strong>Day 30:</strong> A final, low-pressure note that leaves the door open.</li>'
 '</ul>'
 '<h3>Lead with value, not pressure</h3>'
 '<p>Every touch should give the prospect a reason to re-engage &mdash; a photo from the inspection, a '
 'clarification on scope, a heads-up on weather windows. When follow-ups feel useful, they don\'t feel pushy.</p>'
 '<div class="inline-cta"><h3>Never lose a lead in the shuffle again</h3>'
 '<p>Centerpoint tracks every proposal, opens, and follow-up automatically &mdash; so your team always knows who to call next.</p>'
 '<a class="btn btn-accent" href="contact.html">Book a Live Demo</a></div>'
 '<h2>Let software carry the memory</h2>'
 '<p>The reason follow-ups fall through the cracks is simple: people forget. A roofing CRM removes that risk. '
 'With Centerpoint, every proposal has a status, every email is tracked, and reminders fire automatically so '
 'the next step never depends on someone remembering it.</p>'
 '<p>When your follow-up is systematic, you stop losing deals to silence &mdash; and you start closing the jobs '
 'you already earned on the roof.</p>')

related = ""
for cat, date, title, excerpt, img in posts[1:4]:
    related += ('<article class="bcard" data-cat="' + cat + '">' +
      '<div class="img"><img src="' + img + '" alt="' + title + '" loading="lazy" onerror="this.style.display=\'none\'"></div>' +
      '<div class="body"><span class="cat">' + cat + '</span>'
      '<h3><a href="blog-post.html">' + title + '</a></h3>'
      '<div class="meta"><span>' + date + '</span><a href="blog-post.html">Read more &rarr;</a></div></div></article>')

POST = ('<article><div class="article-head"><div class="dots"></div><div class="wrap"><div class="inner">'
 '<div class="crumb"><a href="index.html">Home</a> &rsaquo; <a href="blog.html">Blog</a> &rsaquo; ' + ART["cat"] + '</div>'
 '<span class="cat">' + ART["cat"] + '</span>'
 '<h1>' + ART["title"] + '</h1>'
 '<div class="article-meta"><span class="av">' + av_initials(ART["author"]) + '</span>'
 '<span>' + ART["author"] + '</span><span class="dot"></span><span>' + ART["date"] + '</span>'
 '<span class="dot"></span><span>' + ART["read"] + '</span></div>'
 '</div></div></div>'
 '<div class="article-hero"><div class="frame"><img src="' + ART["img"] + '" alt="' + ART["title"] + '" '
 'onerror="this.style.display=\'none\'"></div></div>'
 '<div class="prose">' + ARTICLE_BODY + '</div>'
 '<div class="share"><span>Share:</span>'
 '<a href="#" aria-label="Share on LinkedIn">in</a><a href="#" aria-label="Share on Facebook">f</a>'
 '<a href="#" aria-label="Share on X">X</a><a href="#" aria-label="Copy link">&#128279;</a></div>'
 '<div class="wrap"><div class="author-box"><div class="av">' + av_initials(ART["author"]) + '</div>'
 '<div><div class="r">' + ART["author_role"] + '</div><div class="k">' + ART["author"] + '</div>'
 '<p>Ben supports roofing contractors across the country through training, implementation, and success '
 'strategy &mdash; drawing on years working directly in the roofing industry.</p></div></div></div>'
 '</article>'
 + '<section class="section related"><div class="wrap"><div class="sec-head center" style="margin-bottom:34px">'
 '<span class="eyebrow">Keep reading</span><h2>Related articles.</h2></div>'
 '<div class="blog-grid">' + related + '</div>'
 '<div class="center" style="margin-top:36px"><a class="btn btn-ghost" href="blog.html">Back to all posts</a></div>'
 '</div></section>'
 + final_cta())
page("blog-post.html", ART["title"] + " | Centerpoint Connect",
     "Most roofing sales die in silence. Here\'s how to build a respectful, consistent follow-up system that wins more commercial roofing jobs.",
     "resources", POST)

print("all pages generated")

