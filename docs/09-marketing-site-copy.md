# Keystone REIT — Marketing Site Copy & Navigation Spec

This file is the **single source of truth for public-website copy**. It maps every nav
item to a route and gives the exact section-by-section copy for that route, taken
verbatim from the approved marketing draft. Build each page's content from this file —
do not invent or paraphrase replacement copy for anything listed below. Where a section
is genuinely missing (e.g. Contact), that is called out explicitly as a TODO rather than
left for you to fabricate.

This complements (does not replace) `05-user-dashboard.md`'s note that `/plans` must read
live data from Convex — the plan **copy/framing** below is the authored content for that
page; the actual plan cards should still be data-driven per the existing PRD build docs,
using these four plans as the seed data.

---

## 1. Navigation spec

**Structure:** Logo · Home · About Us ▾ · How It Works · Investment Plans · Properties ▾ ·
Resources ▾ · Contact ······ Sign In | Get Started

**Behavior:** `About Us`, `Properties`, and `Resources` are dropdown triggers. **Dropdowns
open on hover** (desktop), not click — use a short open/close delay (~150ms) on
mouseleave so the menu doesn't flicker when moving the cursor from trigger to menu. On
mobile/touch, hover doesn't exist — fall back to tap-to-expand accordion behavior within
the mobile sheet nav; do not ship a hover-only interaction that's unusable on mobile.

```
Home                          → /
About Us ▾
  About Keystone REIT         → /about
  Our Mission                 → /about/mission
  Why Keystone REIT           → /about/why-keystone-reit
  Trust & Protection          → /about/trust-and-protection
How It Works                  → /how-it-works
Investment Plans              → /investment-plans
Properties ▾
  Our Properties               → /properties
  Serviced Apartments          → /properties/serviced-apartments
  Property Portfolio           → /properties/portfolio
Resources ▾
  FAQs                         → /faq
  How Real Estate Participation Works → /how-it-works   (same page as top-level "How It Works" — see note in §5)
  Real Estate Insights         → /resources/real-estate-insights
  Investment Guide             → /resources/investment-guide
Contact                        → /contact
Sign In                        → /login       (Phase 3 auth)
Get Started                    → /signup       (Phase 3 auth)
```

Footer quick links (from the Home page footer): Home, About Us, How It Works, Investment
Plans, Why Real Estate?, FAQs, Contact Us, Terms and Conditions, Privacy Policy.
"Why Real Estate?" in the footer maps to `/about/why-keystone-reit` (the footer copy uses
a slightly different label than the navbar's "Why Keystone REIT" — same page, keep one
canonical route and point both labels at it).

**Company info (use exactly, footer + wherever registration/company info appears):**
- Name: Keystone REIT
- Registration No.: 11793537
- Website: www.keystonereits.com
- Tagline: "Real Estate. Made More Accessible."

---

## 2. Route: `/` — Home

**Hero**
> **REAL ESTATE. MADE MORE ACCESSIBLE.**
> Build a stake in professionally managed real estate from $200.
>
> Keystone REIT provides an accessible way to participate in real estate through
> professionally managed serviced apartments and short-term rental properties.
>
> Investment opportunities starting from $200, with plan-dependent weekly ROI of 4–8%.
>
> **[GET STARTED]**
>
> Keystone REIT — Registration No. 11793537

**Section 2 — The Opportunity**
> **REAL ESTATE HAS ALWAYS BEEN VALUABLE. NOW, IT'S MORE ACCESSIBLE.**
>
> Owning or participating in income-generating property has traditionally required
> significant capital, property management, and time.
>
> Keystone REIT changes the way people can participate.
>
> Through our mutual fund structure, funds from investors are pooled and professionally
> deployed toward acquiring and furnishing serviced apartments and short-term rental
> properties, including Airbnb-style apartments.
>
> These properties are operated and rented to guests, creating rental income that is
> distributed to investors as dividends according to their investment amount and
> applicable investment terms.
>
> You don't have to buy an entire property to participate in real estate.
>
> Start from $200 and participate in a professionally managed real estate model.
>
> **[GET STARTED]**

**Section 3 — How Keystone REIT Works**
> **SIMPLE. STRUCTURED. PROFESSIONAL.**
>
> **01 — FUNDS ARE POOLED** — Capital from investors is pooled through our mutual fund
> structure.
>
> **02 — REAL ESTATE IS ACQUIRED** — The pooled capital is used to acquire and furnish
> carefully selected serviced apartments and short-term rental properties.
>
> **03 — PROPERTIES GENERATE RENTAL INCOME** — The apartments are made available to
> guests on a daily or short-term basis, generating rental income.
>
> **04 — INCOME IS DISTRIBUTED** — Income generated from the properties is distributed
> to investors as dividends based on their investment amount and the applicable terms of
> the investment.
>
> Real estate participation, simplified.
>
> **[SEE HOW IT WORKS]** → links to `/how-it-works`

**Section 4 — Why Keystone REIT?**
> **MORE THAN REAL ESTATE. A SIMPLER WAY TO PARTICIPATE.**
>
> **Accessible Entry** — Real estate participation starts from just $200, making the
> opportunity more accessible.
>
> **Professionally Managed** — From property acquisition and furnishing to operations,
> the real estate process is professionally managed.
>
> **Income-Focused Properties** — Our focus is on serviced apartments and short-term
> rental properties designed to generate rental income.
>
> **Diversified Participation** — Instead of putting capital toward a single property
> independently, pooled funds allow participation through a broader real estate strategy.
>
> **Asset Protection** — Our properties are insured against covered risks, providing an
> additional layer of protection for the underlying assets.
>
> **Transparent Structure** — We believe investors should understand where their capital
> goes, how the model works, and how distributions are determined.

**Section 5 — Why Real Estate?**
> **DON'T JUST WATCH PROPERTY VALUES GROW. PARTICIPATE IN THE REAL ESTATE ECONOMY.**
>
> Real estate is one of the world's most established asset classes.
>
> From residential apartments to short-term accommodation, property can create value
> through both the underlying asset and the income generated from its use.
>
> Keystone REIT focuses on turning this concept into a more accessible participation
> model.
>
> Your path to real estate participation doesn't have to begin with buying an entire
> building.
>
> It can begin with $200.
>
> **[START YOUR JOURNEY]**

**Section 6 — Our Model**
> **TURNING PROPERTY INTO AN INCOME-GENERATING BUSINESS**
>
> Keystone REIT focuses on serviced apartments and short-term rental properties where
> demand for quality accommodation creates opportunities for rental income.
>
> We manage the process behind the scenes:
>
> **Property Selection** — Identifying suitable real estate opportunities.
>
> **Furnishing & Preparation** — Preparing properties to meet the expectations of
> short-term guests.
>
> **Property Operations** — Managing the properties and their day-to-day rental
> activities.
>
> **Income Distribution** — Distributing generated income to investors as dividends in
> accordance with the applicable investment terms.
>
> We handle the property operations. You participate in the opportunity.

**Section 7 — Investment Plans (teaser)**
> **CHOOSE A PLAN THAT FITS YOUR GOALS**
>
> Keystone REIT offers investment plans designed to provide different participation
> options.
>
> Starting from $200
>
> Weekly ROI: 4–8% — depending on the selected plan.
>
> Each plan has its own applicable terms, duration, and distribution structure.
>
> Find the plan that works for you.
>
> **[VIEW INVESTMENT PLANS]** → links to `/investment-plans`

**Section 8 — Built Around Real Property**
> **YOUR PARTICIPATION IS CONNECTED TO REAL ESTATE.**
>
> Keystone REIT's model is centered around tangible property.
>
> Capital is deployed toward acquiring and furnishing serviced apartments and short-term
> rental properties that can be operated as income-generating accommodation.
>
> This gives our model a clear foundation:
>
> Capital → Real Estate → Rental Activity → Income → Investor Distributions
>
> It's a straightforward approach to participating in the real estate market.

**Section 9 — Trust & Protection (teaser)**
> **BUILT WITH RESPONSIBILITY IN MIND.**
>
> We understand that participating in an investment requires trust.
>
> That's why Keystone REIT is built around a clear structure, professionally managed
> properties, and an emphasis on responsible asset management.
>
> Our underlying properties are insured against covered risks, providing additional
> protection for the assets supporting the business.
>
> Keystone REIT — Registration No. 11793537
>
> We are committed to building a real estate participation platform based on
> professionalism, transparency, and long-term value creation.

**Section 10 — Who Is Keystone REIT For?**
> **REAL ESTATE PARTICIPATION FOR PEOPLE WHO WANT MORE OPTIONS.**
>
> Keystone REIT is designed for individuals who want to participate in real estate
> without having to personally source properties, furnish apartments, manage guests, or
> handle day-to-day property operations.
>
> Whether you're taking your first step into real estate or looking for another way to
> participate in the property market, Keystone REIT provides a structured approach to
> real estate participation.
>
> You don't need to own the whole property to have a place in real estate.
>
> **[GET STARTED FROM $200]**

**Section 11 — FAQ (homepage teaser — short list; full FAQ lives at `/faq`)**
> **WHAT IS KEYSTONE REIT?** Keystone REIT provides an accessible way for investors to
> participate in real estate through a professionally managed mutual fund structure
> focused on serviced apartments and short-term rental properties.
>
> **HOW MUCH DO I NEED TO START?** Investment opportunities start from $200.
>
> **HOW DOES THE MODEL WORK?** Funds from investors are pooled through our mutual fund
> and used to acquire and furnish serviced apartments and short-term rental properties.
> The properties are then rented to guests, generating rental income. Income generated is
> distributed to investors as dividends according to their investment amount and
> applicable investment terms.
>
> **WHAT TYPE OF PROPERTIES DOES KEYSTONE REIT FOCUS ON?** Our focus is on
> income-generating serviced apartments and short-term rental properties, including
> Airbnb-style apartments.
>
> **WHAT IS THE WEEKLY ROI?** Weekly ROI ranges from 4–8% depending on the selected
> investment plan. The applicable rate, duration, and distribution terms depend on the
> specific plan selected.
>
> **ARE THE PROPERTIES INSURED?** Yes. Our properties are insured against covered risks,
> providing an additional layer of protection for the underlying assets.
>
> **DO I HAVE TO MANAGE THE PROPERTY MYSELF?** No. Keystone REIT professionally manages
> the property and investment process, including the operational side of the properties.
>
> **HOW DO I GET STARTED?** Simply choose an available investment plan, review the
> applicable terms, and follow the registration and investment process.
>
> **[VIEW INVESTMENT PLANS]**

**Section 12 — Final CTA**
> **YOUR REAL ESTATE JOURNEY CAN START TODAY.**
>
> You don't need millions to participate in real estate.
> You don't need to search for properties.
> You don't need to furnish apartments.
> You don't need to manage guests.
>
> Keystone REIT brings the real estate opportunity and professional management together
> in one accessible platform.
>
> Start from $200.
>
> Explore the plans. Choose your preferred option. Take your first step toward
> participating in real estate.
>
> **[START INVESTING NOW]**   **[LEARN MORE ABOUT KEYSTONE REIT]**

**Footer**
> KEYSTONE REIT — Real Estate. Made More Accessible.
>
> Keystone REIT provides investors with an accessible way to participate in
> professionally managed real estate through serviced apartments and short-term rental
> properties.
>
> Registration No.: 11793537 · Website: www.keystonereits.com
>
> Quick Links: Home, About Us, How It Works, Investment Plans, Why Real Estate?, FAQs,
> Contact Us
>
> Terms and Conditions | Privacy Policy
>
> © 2026 Keystone REIT. All Rights Reserved.

---

## 3. Route: `/about` — About Keystone REIT

**Intro**
> **MAKING REAL ESTATE PARTICIPATION MORE ACCESSIBLE**
>
> Keystone REIT was created around a simple idea: real estate should be more accessible.
>
> Traditionally, participating in real estate has required significant capital,
> extensive property knowledge, and the time and expertise needed to manage properties
> effectively.
>
> Keystone REIT provides an alternative approach.
>
> Through our mutual fund structure, funds from investors are pooled and professionally
> deployed toward the acquisition and furnishing of serviced apartments and short-term
> rental properties. These properties are then operated and rented to guests, creating a
> real estate-based income model.
>
> With investment opportunities starting from $200, Keystone REIT makes it possible for
> more people to participate in professionally managed real estate without having to
> personally purchase, furnish, or manage an entire property.

**Who We Are**
> **A REAL ESTATE PARTICIPATION PLATFORM BUILT AROUND REAL PROPERTY**
>
> Keystone REIT is focused on creating a structured and accessible way for individuals
> to participate in the real estate market.
>
> Our model centers on serviced apartments and short-term rental properties, including
> Airbnb-style apartments, where professionally managed properties can generate rental
> income through guest stays.
>
> From property acquisition and furnishing to day-to-day operations, the process is
> professionally managed so that investors can participate without taking on the
> responsibilities of directly managing the properties.
>
> We believe real estate participation should be simple to understand, professionally
> managed, and connected to tangible assets.

**What We Do**
> **FROM CAPITAL TO REAL ESTATE**
>
> Our approach brings together investors and real estate opportunities through a
> structured process.
>
> **01 — POOLING CAPITAL** — Funds from investors are pooled through our mutual fund
> structure.
>
> **02 — ACQUIRING PROPERTIES** — The capital is deployed toward acquiring suitable
> serviced apartments and short-term rental properties.
>
> **03 — PREPARING THE PROPERTIES** — Selected properties are furnished and prepared to
> provide quality accommodation for short-term guests.
>
> **04 — MANAGING THE PROPERTIES** — The properties are professionally managed and made
> available to guests on a daily or short-term basis.
>
> **05 — GENERATING RENTAL INCOME** — Guest bookings generate rental income from the
> properties.
>
> **06 — DISTRIBUTING INCOME** — Income generated from the properties is distributed to
> investors as dividends based on their investment amount and the applicable terms of the
> investment.
>
> A SIMPLE CONCEPT. PROFESSIONALLY MANAGED.

**Why Keystone REIT? (grid — short version; full page is `/about/why-keystone-reit`)**
> **ACCESSIBLE** — Investment opportunities start from $200, opening the door to real
> estate participation without requiring the purchase of an entire property.
>
> **PROFESSIONALLY MANAGED** — Our approach covers the property lifecycle—from
> acquisition and furnishing to rental operations and management.
>
> **REAL PROPERTY** — Our model is centered around tangible real estate, particularly
> serviced apartments and short-term rental properties.
>
> **INCOME-FOCUSED** — Properties are operated as short-term accommodation, creating
> opportunities for rental income through guest bookings.
>
> **STRUCTURED** — Our mutual fund structure provides an organized framework for pooling
> capital and participating in real estate opportunities.
>
> **PROTECTION** — Our underlying properties are insured against covered risks,
> providing an additional layer of protection for the assets supporting the business.

**Our Approach to Real Estate**
> **WE BELIEVE THE BEST OPPORTUNITIES BEGIN WITH THE RIGHT FOUNDATION**
>
> Real estate is more than bricks, walls, and locations.
>
> The value of a property can be influenced by how well it is selected, furnished,
> positioned, marketed, and managed.
>
> That's why our approach goes beyond simply acquiring property.
>
> We focus on creating attractive accommodation, managing operations professionally, and
> positioning properties to serve the needs of short-term guests.
>
> Property + Management + Demand = A Stronger Real Estate Model

**Built on Trust**
> **PROFESSIONALISM MATTERS**
>
> We understand that participating in an investment requires confidence in the platform
> managing it.
>
> That's why Keystone REIT is committed to operating with professionalism, transparency,
> and responsible asset management.
>
> We aim to ensure that investors can clearly understand:
> - How the Keystone REIT model works
> - Where pooled capital is deployed
> - How properties generate rental income
> - How distributions are determined
> - The applicable terms of each investment plan
>
> Our underlying properties are insured against covered risks, providing an additional
> layer of protection for the assets supporting the business.

**Our Commitment**
> **REAL ESTATE. MADE MORE ACCESSIBLE.**
>
> Keystone REIT is committed to building a real estate participation platform designed
> for today's investor.
>
> We believe participation shouldn't have to begin with owning an entire building.
>
> It can begin with understanding the opportunity, choosing an appropriate plan, and
> taking that first step.
>
> Starting from $200, Keystone REIT opens the door to a more accessible way to
> participate in professionally managed real estate.

**Company Information (info block)**
> KEYSTONE REIT
> Registration Number: 11793537
> Business Focus: Real Estate Participation & Property Management
> Property Focus: Serviced Apartments & Short-Term Rental Properties
> Starting Investment: $200
> Plan-Dependent Weekly ROI: 4–8%

**Closing CTA**
> **READY TO PARTICIPATE? YOUR REAL ESTATE JOURNEY STARTS HERE.**
>
> Explore our investment plans and discover a more accessible way to participate in
> professionally managed real estate.
>
> Start from $200.
>
> **[VIEW INVESTMENT PLANS]**   **[GET STARTED]**

---

## 4. Route: `/about/mission` — Our Mission

**Our Mission**
> **MAKING REAL ESTATE PARTICIPATION MORE ACCESSIBLE**
>
> At Keystone REIT, we believe participation in real estate should not be limited to
> people with the capital to purchase an entire property.
>
> Our mission is to make real estate participation more accessible by creating a
> professionally managed platform through which individuals can participate in
> income-generating real estate with a starting point of $200.
>
> Through our mutual fund structure, funds from investors are pooled and deployed toward
> the acquisition and furnishing of serviced apartments and short-term rental
> properties. These properties are professionally managed and operated to generate
> rental income, with income distributed to investors as dividends in accordance with
> their investment amount and applicable investment terms.

**Our Vision**
> **A FUTURE WHERE MORE PEOPLE HAVE A PLACE IN REAL ESTATE**
>
> Real estate has long been one of the world's most established asset classes, yet
> direct property ownership can require substantial capital, expertise, and ongoing
> management.
>
> We envision a future where more individuals can participate in the opportunities
> created by real estate without having to personally purchase, furnish, or manage an
> entire property.
>
> Keystone REIT is working toward making that vision a reality through accessibility,
> professional management, and a structured approach to real estate participation.

**What Drives Us**
> **ACCESSIBILITY** — We believe the opportunity to participate in real estate should be
> available beyond traditional property ownership. With investment opportunities
> starting from $200, we are working to lower the barrier to entry while maintaining a
> professionally managed investment structure.
>
> **PROFESSIONAL MANAGEMENT** — Real estate requires more than capital. It requires
> property selection, furnishing, operations, guest management, maintenance, and ongoing
> oversight. Our approach is to professionally manage these processes so investors can
> participate without having to manage the properties themselves.
>
> **INCOME-GENERATING REAL ESTATE** — Our focus is on properties that can generate
> income through short-term accommodation. By acquiring and furnishing serviced
> apartments and short-term rental properties, we aim to create a real estate model
> built around active property operations and rental activity.
>
> **RESPONSIBLE ASSET MANAGEMENT** — We understand that participation in an investment
> comes with trust and responsibility. We are committed to managing the underlying real
> estate with care and maintaining structures designed to support responsible asset
> management. Our properties are insured against covered risks, providing an additional
> layer of protection for the underlying assets.
>
> **TRANSPARENCY** — We believe people should understand what they are participating in.
> From how our model works to how investment plans are structured and how distributions
> are determined, we aim to communicate clearly and provide information investors need
> to make informed decisions.

**Our Approach**
> **FROM CAPITAL TO REAL ESTATE**
>
> Our model is built around a simple principle: bringing capital and real estate
> opportunities together.
>
> Funds from investors are pooled through our mutual fund structure and deployed toward
> real estate assets. Properties are acquired, furnished, and professionally managed
> before being made available to guests.
>
> The resulting rental activity generates income, which is distributed to investors as
> dividends according to their investment amount and applicable investment terms.
>
> Our approach can be summarized simply:
>
> POOL → ACQUIRE → FURNISH → OPERATE → GENERATE INCOME → DISTRIBUTE
>
> This allows Keystone REIT to focus on what we do best—managing the real estate
> process—while providing investors with an accessible way to participate.

**Our Commitment**
> **BUILDING FOR THE LONG TERM**
>
> Keystone REIT is not simply about providing access to property.
>
> We are building a platform centered around professionalism, accessibility, responsible
> management, and long-term value creation.
>
> Every property, every investment plan, and every operational decision contributes to
> our broader mission of creating a more accessible pathway into real estate
> participation.
>
> We believe real estate should not only be something people see around them.
>
> It should be something more people can participate in.

**Why Keystone REIT?**
> **REAL ESTATE. MADE MORE ACCESSIBLE.**
>
> With Keystone REIT, participation starts from $200, while the property acquisition,
> furnishing, and operational processes are professionally managed.
>
> Our focus is simple:
> Make real estate participation more accessible.
> Build around real property.
> Manage professionally.
> Operate responsibly.
> Create opportunities for participation.

**Our Promise / Closing**
> We are committed to building Keystone REIT with a clear sense of purpose: to make real
> estate participation more accessible while professionally managing the properties and
> investment process on behalf of our investors.
>
> Keystone REIT — Registration No. 11793537
>
> Your place in real estate can start here.
>
> **[GET STARTED]**   **[EXPLORE INVESTMENT PLANS]**

---

## 5. Route: `/about/why-keystone-reit` — Why Keystone REIT

(Footer label "Why Real Estate?" also points here.)

**Intro**
> **REAL ESTATE PARTICIPATION, MADE SIMPLE.**
>
> Real estate has long been one of the world's most established asset classes. Yet,
> participating in property ownership or income-generating real estate has traditionally
> required substantial capital, time, expertise, and ongoing management.
>
> Keystone REIT offers a different approach.
>
> Through our professionally managed real estate model, investors can participate in
> serviced apartments and short-term rental properties from $200, without having to
> personally source properties, furnish apartments, manage guests, or handle day-to-day
> operations.
>
> We make real estate participation more accessible, structured, and professionally
> managed.
>
> **[GET STARTED]**

**Why Choose Keystone REIT? (numbered sections)**

**01 — Accessible Real Estate Participation**
> You don't need to purchase an entire property to participate in real estate. With
> investment opportunities starting from $200, Keystone REIT provides a more accessible
> entry point for individuals who want to participate in the real estate market. Start
> where you are. Build from there.

**02 — Your Capital Is Connected To Real Property**
> Our model is built around tangible real estate. Funds are pooled through our mutual
> fund structure and deployed toward acquiring and furnishing serviced apartments and
> short-term rental properties. These properties are then operated as accommodation for
> guests, creating rental activity around the underlying assets. Real property. Real
> operations. A structured participation model.

**03 — Professional Property Management**
> Real estate can be rewarding, but managing property yourself can be demanding. Finding
> suitable properties, furnishing them, managing guests, maintaining standards, and
> handling daily operations all require time and expertise. Keystone REIT manages these
> processes professionally, allowing investors to participate without taking on the
> day-to-day responsibilities of property management. We manage the property operations.
> You participate in the opportunity.

**04 — Income-Generating Property Model**
> Keystone REIT focuses on serviced apartments and short-term rental properties with the
> potential to generate rental income through guest stays. The income generated from
> these properties is distributed to investors as dividends based on their investment
> amount and the applicable terms of the investment. Our investment plans currently
> provide plan-dependent weekly ROI of 4–8%. Returns are dependent on the selected
> investment plan and its applicable terms and are not guaranteed.

**05 — A Structured Approach**
> We believe participation in real estate should be clear and easy to understand. Our
> model follows a straightforward process:
> - **Funds Are Pooled** — Capital from investors is pooled through our mutual fund
>   structure.
> - **Properties Are Acquired** — Capital is deployed toward suitable serviced
>   apartments and short-term rental properties.
> - **Properties Are Prepared & Operated** — Properties are furnished and professionally
>   managed for guest accommodation.
> - **Rental Income Is Generated** — Guest stays create rental activity from the
>   properties.
> - **Income Is Distributed** — Generated income is distributed to investors as
>   dividends according to their investment amount and applicable investment terms.
>
> One clear model, professionally managed from property acquisition to operations.

**06 — Asset Protection**
> We understand the importance of protecting the underlying real estate assets. Our
> properties are insured against covered risks, providing an additional layer of
> protection for the assets supporting the business. This forms part of our broader
> commitment to responsible property management.

**07 — Transparency Matters**
> Trust is earned through clarity. At Keystone REIT, we believe investors should be able
> to understand: where the capital is being deployed; how the real estate model works;
> how properties generate rental income; how investment plans are structured; how
> distributions are determined. Our goal is to build a platform where the opportunity is
> easy to understand and the investment process is straightforward.

**08 — Built For Different Types Of Investors**
> You may be new to real estate. You may already understand property investment. You may
> simply be looking for a more accessible way to participate in the real estate market.
> Wherever you are on your journey, Keystone REIT provides a structured way to
> participate in professionally managed real estate without requiring you to personally
> own and manage an entire property. Your real estate journey doesn't have to start with
> a building. It can start from $200.
>
> **[EXPLORE INVESTMENT PLANS]**

**Our Approach**
> **WE FOCUS ON THE PROPERTY. YOU FOCUS ON YOUR GOALS.**
>
> Keystone REIT combines real estate opportunities with professional property
> management. Our focus is on identifying suitable properties, preparing them for the
> short-term rental market, managing their operations, and creating a structured
> environment through which investors can participate.
>
> Our approach is built around four principles: **Accessibility** (making real estate
> participation available to more people), **Professional Management** (managing
> property operations with care and structure), **Transparency** (keeping the investment
> model clear and understandable), **Responsibility** (managing the underlying assets
> with a long-term mindset).

**Why Now?**
> **REAL ESTATE IS EVOLVING. PARTICIPATION SHOULD TOO.**
>
> The way people access real estate is changing. Short-term accommodation, serviced
> apartments, and professionally managed rental properties have created new
> opportunities within the property market.
>
> Keystone REIT is positioned to make participation in this evolving real estate
> landscape more accessible. Instead of requiring every individual to independently find
> a property, raise substantial capital, furnish it, and manage guests, our model brings
> these processes together under professional management.
>
> Less complexity. More accessibility. A smarter way to participate in real estate.

**Our Commitment**
> **BUILDING TRUST BEYOND THE INVESTMENT.**
>
> Keystone REIT is committed to building a professional real estate platform founded on
> responsible management, clear communication, and accessibility.
>
> We understand that choosing an investment platform is about more than numbers. It's
> about trust. It's about knowing how the model works. It's about understanding where
> capital is deployed. And it's about having confidence in the people managing the
> process.
>
> That's the standard we are building toward at Keystone REIT.
>
> Keystone REIT — Registration No. 11793537

**Closing CTA**
> **READY TO PARTICIPATE? REAL ESTATE. MADE MORE ACCESSIBLE.**
>
> With investment opportunities starting from $200, Keystone REIT provides a structured
> way to participate in professionally managed serviced apartments and short-term rental
> properties.
>
> Explore the available investment plans and find the option that fits your goals.
>
> **[VIEW INVESTMENT PLANS]**   **[GET STARTED]**

---

## 6. Route: `/about/trust-and-protection` — Trust & Protection

**Intro**
> **BUILT ON TRUST. STRUCTURED FOR RESPONSIBLE REAL ESTATE PARTICIPATION.**
>
> At Keystone REIT, we understand that choosing an investment platform requires more
> than seeing an attractive opportunity. It requires confidence in the structure, the
> people managing it, the underlying assets, and the processes behind it.
>
> Our approach is built around professional management, real assets, transparency, and
> responsible operations.

**Real Estate At The Core**
> Keystone REIT's model is centered around tangible real estate.
>
> Through our mutual fund structure, funds from investors are pooled and professionally
> deployed toward the acquisition and furnishing of serviced apartments and short-term
> rental properties.
>
> These properties are then operated as accommodation for guests, creating rental income
> that forms the basis for investor distributions in accordance with the applicable
> investment terms.
>
> This gives our model a clear foundation:
>
> Investor Funds → Real Estate → Property Operations → Rental Income → Investor
> Distributions

**Professional Property Management**
> **WE HANDLE THE COMPLEXITY BEHIND THE OPPORTUNITY.**
>
> Real estate can require significant time, expertise, and operational attention.
>
> From property selection and furnishing to guest accommodation and day-to-day
> management, Keystone REIT oversees the property process so investors do not have to
> manage the operational demands themselves.
>
> Our focus is to manage the underlying properties professionally while maintaining a
> structured approach to the investment process.

**Insurance For Underlying Assets**
> **AN ADDITIONAL LAYER OF PROTECTION.**
>
> Our underlying properties are insured against covered risks.
>
> Insurance provides an additional layer of protection for the assets supporting our
> real estate operations, subject to the applicable insurance policy terms, conditions,
> exclusions, and limits.
>
> We believe responsible asset management includes taking appropriate measures to
> protect the properties that form the foundation of our model.

**Transparency Matters**
> **KNOW WHAT YOU ARE PARTICIPATING IN.**
>
> We believe confidence comes from understanding.
>
> Before participating, investors should have access to clear information about the
> investment structure, applicable terms, investment plans, distribution arrangements,
> and relevant conditions.
>
> Keystone REIT is committed to communicating our model clearly so that investors can
> make informed decisions based on the information available to them.

**A Structured Approach**
> **FROM CAPITAL TO PROPERTY OPERATIONS.**
>
> **01 — CAPITAL IS POOLED** — Funds are pooled through our mutual fund structure.
>
> **02 — REAL ESTATE IS ACQUIRED** — Capital is deployed toward suitable serviced
> apartments and short-term rental properties.
>
> **03 — PROPERTIES ARE PREPARED** — Properties are furnished and prepared for guest
> accommodation.
>
> **04 — PROPERTIES ARE OPERATED** — The properties are professionally managed and made
> available to guests.
>
> **05 — INCOME IS GENERATED** — Guest bookings generate rental income from the
> properties.
>
> **06 — DISTRIBUTIONS ARE MADE** — Income generated from the properties is distributed
> to investors as dividends in accordance with the applicable investment terms.

**Responsible Real Estate Participation**
> Keystone REIT is built around the principle that real estate participation should be
> accessible without sacrificing structure and professionalism. We combine:
>
> - **Accessible Entry** — Investment opportunities starting from $200.
> - **Tangible Assets** — A model centered around serviced apartments and short-term
>   rental properties.
> - **Professional Management** — Property operations and the investment process are
>   professionally managed.
> - **Asset Protection** — Underlying properties are insured against covered risks.
> - **Clear Communication** — We aim to provide investors with relevant information
>   about our model and applicable investment terms.

**Our Commitment**
> **PROFESSIONALISM. RESPONSIBILITY. TRANSPARENCY.**
>
> We are committed to building Keystone REIT around responsible management and
> long-term credibility.
>
> Our objective is not simply to provide access to real estate. It is to create a
> structured platform through which people can participate in real estate while the
> underlying property operations are professionally managed.
>
> Keystone REIT — Registration No. 11793537
>
> REAL ESTATE. MADE MORE ACCESSIBLE.
>
> **[VIEW INVESTMENT PLANS]**   **[HOW IT WORKS]**

---

## 7. Route: `/how-it-works` — How It Works
*(Also the destination for the Resources ▾ "How Real Estate Participation Works" link —
one page, two nav entry points; do not duplicate the page under two routes.)*

**Intro**
> **REAL ESTATE, WITHOUT THE COMPLEXITY**
>
> A simpler way to participate in professionally managed property.
>
> Real estate has traditionally required substantial capital, extensive property
> knowledge, and the time to manage properties.
>
> Keystone REIT provides a structured way for individuals to participate in real estate
> through a professionally managed mutual fund structure.
>
> Instead of having to purchase, furnish, and manage an entire property independently,
> funds from investors are pooled and deployed toward selected serviced apartments and
> short-term rental properties.
>
> The properties are then operated as accommodation for guests, generating rental income
> that can be distributed to investors as dividends according to their investment amount
> and applicable investment terms.
>
> Real estate participation starts from $200 with Keystone REIT.
>
> **[EXPLORE INVESTMENT PLANS]**

**So, How Does It Work? (numbered steps)**

**01 — Investors Participate**
> Individuals choose an available Keystone REIT investment plan and participate
> according to the plan's applicable terms. Investment opportunities start from $200.

**02 — Funds Are Pooled**
> Funds from participating investors are pooled through our mutual fund structure.
> Pooling capital allows the fund to deploy resources toward real estate opportunities
> rather than requiring each participant to independently purchase an entire property.

**03 — Real Estate Is Acquired**
> The pooled capital is used to acquire and furnish selected serviced apartments and
> short-term rental properties. Our focus is on properties with the potential to
> generate income through short-term accommodation.

**04 — Properties Are Operated**
> The properties are professionally managed and made available to guests on a daily or
> short-term basis. This involves the operational activities required to prepare,
> maintain, and manage the apartments for guests. The goal is simple: turn quality
> property into a professionally managed accommodation business.

**05 — Rental Income Is Generated**
> Guests pay for their accommodation, creating rental income from the properties. The
> performance of the properties depends on factors such as occupancy, rental demand,
> operating costs, property performance, and market conditions.

**06 — Investor Distributions**
> Income generated from the properties is distributed to investors as dividends based on
> their investment amount and the applicable terms of their selected investment plan.
> Available plans may have different rates, durations, and distribution structures.
> Plan-dependent weekly ROI ranges from 4–8%.

**The Keystone REIT Model (flow diagram copy)**
> Investor Participation → Funds Pooled Through the Mutual Fund → Property Acquisition &
> Furnishing → Serviced Apartments & Short-Term Rentals → Guest Accommodation → Rental
> Income → Investor Distributions
>
> This is the foundation of the Keystone REIT model.

**Why Pooling Capital Matters**
> **REAL ESTATE PARTICIPATION DOESN'T HAVE TO MEAN BUYING AN ENTIRE PROPERTY**
>
> Purchasing a property independently can require significant capital. There are also
> costs associated with furnishing, maintenance, guest management, marketing, and
> day-to-day operations.
>
> A pooled structure allows participating investors to access a professionally managed
> real estate model without having to personally handle every part of the property
> business.
>
> Keystone REIT manages the process. Investors participate according to the terms of
> their selected plan.

**What Kind Of Real Estate Do We Focus On?**
> **SERVICED APARTMENTS & SHORT-TERM RENTALS**
>
> Keystone REIT focuses on serviced apartments and short-term rental properties,
> including Airbnb-style apartments.
>
> These properties are furnished and operated to provide comfortable accommodation for
> guests seeking short-term stays.
>
> The rental activity creates the income stream that supports the investment model.

**What Makes This Different From Buying A Property Yourself?**
> **TRADITIONAL PROPERTY OWNERSHIP** — Buying a property independently can mean
> handling: property sourcing, purchase negotiations, furnishing, guest management,
> maintenance, marketing, bookings, daily operations.
>
> **KEYSTONE REIT** — With Keystone REIT, the property and operational process is
> professionally managed. Investors participate through the investment structure while
> Keystone REIT focuses on the underlying real estate and its operations.
>
> Less complexity. More accessibility. A professionally managed approach to real estate
> participation.

**Built Around Real Assets**
> **REAL PROPERTY IS AT THE HEART OF OUR MODEL.**
>
> Keystone REIT's investment model is connected to tangible real estate.
>
> Funds are deployed toward acquiring and furnishing serviced apartments and short-term
> rental properties that are operated to generate rental income.
>
> Our underlying properties are also insured against covered risks, providing an
> additional layer of protection for the assets supporting the business.

**What Determines The Returns?**
> **REAL ESTATE PERFORMANCE MATTERS.**
>
> Returns from real estate are influenced by the performance of the underlying
> properties. Factors can include: guest demand, occupancy levels, rental rates,
> operating expenses, property location, market conditions, property performance.
>
> Keystone REIT's available investment plans have different applicable terms and
> distribution structures. Weekly ROI is plan-dependent and ranges from 4–8%. Returns
> are not guaranteed, and investment involves risk.

**Who Can Participate?**
> **REAL ESTATE DOESN'T HAVE TO BE ONLY FOR LARGE PROPERTY OWNERS.**
>
> Keystone REIT is designed to make participation in professionally managed real estate
> more accessible. Whether someone is exploring real estate for the first time or
> looking for another way to participate in the property market, our platform provides
> an accessible starting point. Investment opportunities start from $200.

**Your Role. Our Role.**
> **YOUR ROLE** — Choose an available investment plan, review its terms, and participate
> according to the applicable conditions.
>
> **OUR ROLE** — Keystone REIT focuses on the real estate and operational side of the
> model — from property acquisition and furnishing to property management and rental
> operations.
>
> **TOGETHER** — The objective is to create a structured pathway for participating in
> income-generating real estate.

**A Simple Idea (closing narrative)**
> **YOU DON'T HAVE TO OWN AN ENTIRE BUILDING TO PARTICIPATE IN REAL ESTATE.**
>
> Real estate participation can be more accessible than many people realize.
>
> With Keystone REIT, pooled capital is directed toward professionally managed serviced
> apartments and short-term rental properties.
>
> The properties generate rental income through guest stays, and applicable income is
> distributed to investors as dividends according to their investment amount and plan
> terms.
>
> That's real estate participation, made simpler.
>
> **[VIEW INVESTMENT PLANS]**

**Page FAQ**
> **Do I have to buy a property myself?** No. Keystone REIT operates through a pooled
> investment structure. Investors participate according to the applicable terms of
> their selected plan, while the underlying real estate and property operations are
> professionally managed.
>
> **How much is required to participate?** Investment opportunities start from $200.
>
> **What type of properties are involved?** Keystone REIT focuses on serviced apartments
> and short-term rental properties, including Airbnb-style apartments.
>
> **How is income generated?** The properties are rented to guests on a daily or
> short-term basis. Guest payments generate rental income from the properties.
>
> **How are investors paid?** Income generated from the properties is distributed to
> investors as dividends based on their investment amount and the applicable terms of
> their investment plan.
>
> **What is the expected weekly ROI?** Available plans provide plan-dependent weekly ROI
> of 4–8%. The applicable rate, duration, and distribution structure depend on the
> specific plan selected.
>
> **Does real estate participation involve risk?** Yes. All investments involve risk,
> and property performance can be affected by market conditions, occupancy, operating
> expenses, and other factors. Returns are not guaranteed.
>
> **Are the properties insured?** Our underlying properties are insured against covered
> risks, providing an additional layer of protection for the assets.

**Closing CTA**
> **READY TO PARTICIPATE? YOUR REAL ESTATE JOURNEY CAN START FROM $200.**
>
> You don't need to purchase an entire property. You don't need to manage guests. You
> don't need to furnish apartments. You don't need to handle the day-to-day operations.
>
> Keystone REIT provides an accessible pathway to professionally managed real estate
> participation.
>
> Explore the available plans and discover how you can participate.
>
> **[VIEW INVESTMENT PLANS]**   **[GET STARTED]**

---

## 8. Route: `/investment-plans` — Investment Plans

**Intro**
> **CHOOSE YOUR REAL ESTATE PARTICIPATION PLAN — A SIMPLE WAY TO PARTICIPATE IN
> PROFESSIONALLY MANAGED REAL ESTATE.**
>
> Keystone REIT offers structured investment plans designed to make real estate
> participation more accessible at different levels of capital.
>
> With plans starting from $200 and plan-dependent weekly ROI ranging from 4% to 8%, you
> can choose the option that best matches your preferred level of participation.
>
> Explore the plans. Review the terms. Choose your preferred option.
>
> **[GET STARTED]**

**Our Investment Plans — all plans: 1-year duration, weekly distribution**

Seed these four as the initial `investmentPlans` rows (per `02-database-and-backend.md`):

| Plan | Minimum Participation | Weekly ROI | Duration | Distribution |
|---|---|---|---|---|
| **Foundation** | $200 | 4% | 1 Year | Weekly |
| **Growth** | $10,000 | 5% | 1 Year | Weekly |
| **Premium** | $50,000 | 6% | 1 Year | Weekly |
| **Elite** | $100,000 | 8% | 1 Year | Weekly |

Per-plan card copy:

> **FOUNDATION PLAN** — *A simple start to real estate participation.* The Foundation
> Plan provides an accessible entry point for individuals looking to participate in
> professionally managed real estate with a starting amount of $200. Ideal for those
> beginning their real estate participation journey. **[SELECT FOUNDATION PLAN]**
>
> **GROWTH PLAN** — *Step up your real estate participation.* The Growth Plan is
> designed for participants looking to commit a higher level of capital while
> participating in the same professionally managed real estate model. A higher
> participation level for those ready to take the next step. **[SELECT GROWTH PLAN]**
>
> **PREMIUM PLAN** — *Greater participation. Greater exposure.* The Premium Plan is
> designed for participants seeking a larger level of participation in Keystone REIT's
> real estate model. Built for participants looking for a higher level of capital
> participation. **[SELECT PREMIUM PLAN]**
>
> **ELITE PLAN** — *Our highest level of participation.* The Elite Plan is designed for
> participants seeking Keystone REIT's highest available plan level and corresponding
> plan-dependent weekly ROI. For participants ready for a significant level of real
> estate participation. **[SELECT ELITE PLAN]**

**How Your Participation Works**
> **FROM CAPITAL TO REAL ESTATE INCOME**
>
> Regardless of the plan selected, your participation follows the Keystone REIT model.
>
> **01 — SELECT YOUR PLAN** → **02 — COMPLETE YOUR PARTICIPATION** (review terms,
> complete registration and investment process) → **03 — FUNDS ARE POOLED** → **04 —
> CAPITAL IS DEPLOYED** (toward acquiring/furnishing serviced apartments & short-term
> rentals) → **05 — PROPERTIES ARE OPERATED** (professionally managed, rented to guests
> daily/short-term) → **06 — INCOME IS DISTRIBUTED** (dividends per investment amount and
> applicable plan terms)

**Why Participate Through Keystone REIT?**
> **WE HANDLE THE PROPERTY SIDE. YOU PARTICIPATE IN THE OPPORTUNITY.**
>
> With Keystone REIT, you don't have to personally deal with the traditional
> responsibilities associated with operating a short-term rental property.
>
> **Property Sourcing** — We identify suitable real estate opportunities.
> **Property Preparation** — Properties are acquired and furnished for their intended
> use.
> **Guest Accommodation** — Properties are made available to short-term guests.
> **Property Management** — The operational side of the properties is professionally
> managed.
> **Income Distribution** — Generated income is distributed to investors according to
> the applicable investment terms.

**Real Estate At The Core**
> **YOUR PARTICIPATION IS CONNECTED TO REAL PROPERTY**
>
> Keystone REIT focuses on serviced apartments and short-term rental properties. Capital
> is deployed toward acquiring and furnishing properties that can generate rental income
> through short-term accommodation. Our underlying properties are insured against
> covered risks, providing an additional layer of protection for the assets supporting
> the business.
>
> Real property. Professional management. Accessible participation.

**Which Plan Is Right For You? (comparison callouts)**
> Start where you are. Participate at your level.
>
> **FOUNDATION** — From $200 — A lower entry point for those beginning their real estate
> participation journey.
>
> **GROWTH** — From $10,000 — For participants looking to increase their level of
> capital participation.
>
> **PREMIUM** — From $50,000 — For participants seeking a higher level of participation
> in the Keystone REIT model.
>
> **ELITE** — From $100,000 — Our highest available plan level for significant capital
> participation.
>
> There is no need to start at the highest level. Choose the plan that aligns with your
> financial circumstances and objectives.
>
> **[VIEW PLAN DETAILS]**

**Starting From $200 (mid-page CTA)**
> **REAL ESTATE PARTICIPATION CAN START SMALL.**
>
> You don't need to purchase an entire apartment to participate in real estate. With the
> Foundation Plan starting from $200, Keystone REIT provides an accessible entry point
> into a professionally managed real estate participation model.
>
> Your real estate journey can start with one decision.
>
> **[GET STARTED]**

**Important Information (disclosure block — render prominently, not buried)**
> **UNDERSTAND YOUR PLAN BEFORE PARTICIPATING**
>
> Before selecting an investment plan, carefully review the applicable information,
> including:
> - **Investment Amount** — The minimum amount required for the selected plan.
> - **Weekly ROI** — The plan-dependent weekly ROI applicable to the selected plan.
> - **Duration** — All current plans have a 1-year duration.
> - **Distribution** — All current plans provide for weekly distribution, subject to the
>   applicable terms.
> - **Terms & Conditions** — Each participant should review all applicable terms and
>   conditions before confirming participation.

**Page FAQ**
> **What is the minimum amount to start?** The Foundation Plan starts from $200.
>
> **How many investment plans are available?** Keystone REIT currently offers four
> plans: Foundation — $200 at 4% weekly; Growth — $10,000 at 5% weekly; Premium —
> $50,000 at 6% weekly; Elite — $100,000 at 8% weekly.
>
> **How long does each plan last?** All four plans currently have a 1-year duration.
>
> **How are distributions made?** Distributions are made weekly, according to the
> applicable terms of the selected plan.
>
> **Where does the capital go?** Funds are pooled through our mutual fund structure and
> deployed toward acquiring and furnishing serviced apartments and short-term rental
> properties.
>
> **How is income generated?** The properties are rented to guests on a daily or
> short-term basis, generating rental income.
>
> **Do I have to manage the property myself?** No. Keystone REIT professionally manages
> the property and investment process.
>
> **Are the properties insured?** Yes. The underlying properties are insured against
> covered risks.
>
> **Can I change my plan after participating?** Any changes, withdrawals, transfers, or
> other modifications are subject to the applicable terms of the selected plan. Please
> review the plan terms or contact Keystone REIT for clarification.

**Closing CTA**
> **READY TO PARTICIPATE? FIND YOUR PLACE IN REAL ESTATE.**
>
> Real estate participation doesn't have to begin with buying an entire property. With
> Keystone REIT, you can start from $200 and participate through a professionally
> managed real estate model focused on serviced apartments and short-term rental
> properties.
>
> Choose your plan. Review the terms. Take your next step.
>
> **[GET STARTED]**   **[CONTACT US]**

---

## 9. Route: `/properties` — Our Properties

**Intro**
> **REAL ESTATE YOU CAN PARTICIPATE IN.**
>
> At Keystone REIT, our investment model is built around real property.
>
> We acquire and furnish carefully selected serviced apartments and short-term rental
> properties, preparing them for professional operation and guest accommodation.
>
> Through our structured investment model, pooled capital is deployed toward properties
> with the potential to generate rental income while creating a more accessible way for
> individuals to participate in the real estate market.
>
> Real property. Professional management. Accessible participation.
>
> **[GET STARTED]**

**Property-Focused. Income-Driven.**
> **OUR APPROACH TO REAL ESTATE**
>
> We focus on properties that can serve the growing demand for quality, flexible
> accommodation. Our property strategy centers on:
>
> - **Serviced Apartments** — Comfortable, professionally prepared apartments designed
>   for guests seeking quality accommodation for short and extended stays.
> - **Short-Term Rental Properties** — Properties operated for daily and short-term
>   bookings, creating opportunities for recurring rental activity.
> - **Strategic Property Selection** — We consider factors such as location, property
>   quality, guest demand, operating potential, and overall suitability before
>   properties are incorporated into our portfolio.
> - **Professional Preparation** — Selected properties are furnished and prepared to
>   provide a quality guest experience and support efficient operations.

**From Property To Rental Income**
> **HOW OUR PROPERTIES WORK**
>
> **01 — ACQUISITION** — Suitable properties are identified and acquired through the
> Keystone REIT structure.
> **02 — FURNISHING & PREPARATION** — Properties are furnished and prepared for
> short-term accommodation.
> **03 — GUEST BOOKINGS** — The properties are made available to guests on a daily or
> short-term basis.
> **04 — PROPERTY MANAGEMENT** — The properties are professionally managed to support
> smooth day-to-day operations.
> **05 — RENTAL INCOME** — Guest bookings generate rental income from the properties.
> **06 — INVESTOR DISTRIBUTIONS** — Income generated from the properties is distributed
> to investors as dividends according to their investment amount and applicable
> investment terms.
>
> The goal is simple: put suitable properties to productive use.

**Our Property Portfolio (intro teaser on this page — full grid lives at
`/properties/portfolio`)**
> **BUILT AROUND REAL ASSETS**
>
> Keystone REIT's portfolio is focused on serviced apartments and short-term rental
> properties. As our portfolio grows, this page can showcase individual properties and
> provide visitors with a closer look at the real estate supporting our model.

**Property Showcase (two generic featured cards — use as placeholder card components
until real per-property data is available; the actual city-by-city listings belong on
`/properties/portfolio`, §11 below)**
> **FEATURED PROPERTY — Serviced Apartment**
> Property Status: Operational · Property Type: Serviced Apartment · Use: Short-Term
> Accommodation
> A professionally furnished apartment prepared for short-term guest accommodation and
> managed as part of the Keystone REIT property portfolio.
> **[VIEW PROPERTY]**
>
> **FEATURED PROPERTY — Short-Term Rental Apartment**
> Property Status: Operational · Property Type: Short-Term Rental · Use: Guest
> Accommodation
> A quality accommodation property operated to serve guests seeking comfortable and
> flexible short-term stays.
> **[VIEW PROPERTY]**

**Why Property Matters**
> **YOUR PARTICIPATION IS CONNECTED TO REAL ESTATE.**
>
> Keystone REIT is not built around an abstract concept. Our model is centered on
> tangible property that can be acquired, furnished, operated, and rented to guests.
> This creates a clear connection between the investment model and the underlying real
> estate:
>
> Pooled Capital → Property Acquisition → Furnishing & Preparation → Guest Accommodation
> → Rental Activity → Income Generation

**Professional Property Management**
> **WE TAKE CARE OF THE PROPERTY OPERATIONS.**
>
> Owning or participating in real estate can involve much more than acquiring a
> property. There is furnishing, guest management, maintenance, bookings, operations,
> and day-to-day administration.
>
> Keystone REIT's approach is designed to professionally manage these activities so
> investors can participate in the real estate model without having to personally handle
> the day-to-day operation of the properties.
>
> From acquisition to guest accommodation, the property is managed with purpose.

**Protection Of The Underlying Assets**
> **AN ADDITIONAL LAYER OF PROTECTION**
>
> Our underlying properties are insured against covered risks, providing an additional
> layer of protection for the assets supporting the business. We believe responsible
> property management includes taking appropriate measures to protect the real estate
> within our portfolio.

**Property Selection**
> **WE LOOK BEYOND THE FOUR WALLS.**
>
> A property is more than its appearance. Before a property becomes part of our
> portfolio, considerations may include:
> - **Location** — Accessibility and suitability for the intended accommodation market.
> - **Guest Demand** — The potential demand for quality short-term accommodation in the
>   area.
> - **Property Quality** — The condition, functionality, and suitability of the
>   property.
> - **Operating Potential** — The property's potential to function effectively as a
>   serviced apartment or short-term rental.
> - **Income Potential** — The potential for the property to generate rental income
>   under the intended operating model.
>
> Our objective is to build a portfolio around properties that are suitable for
> productive and professional operation.

**Growing The Portfolio**
> **MORE PROPERTIES. MORE OPPORTUNITIES TO PARTICIPATE.**
>
> As Keystone REIT grows, we aim to expand our portfolio with carefully selected
> properties that align with our investment strategy. Each addition to the portfolio
> represents another opportunity to put real estate to productive use while
> strengthening the foundation of our business.
>
> We are building more than a property portfolio. We are building a more accessible
> path to real estate participation.
>
> **[EXPLORE INVESTMENT PLANS]**

**Page FAQ**
> **What types of properties does Keystone REIT acquire?** Our focus is on serviced
> apartments and short-term rental properties, including Airbnb-style apartments.
>
> **Where are your properties located?** Our property portfolio is built around
> locations selected based on suitability, demand, operating potential, and our overall
> property strategy. Specific property locations and details can be displayed on this
> page as properties are added to the portfolio.
>
> **Are the properties furnished?** Yes. Properties acquired for our short-term
> accommodation model are furnished and prepared for guest use.
>
> **Who manages the properties?** Keystone REIT professionally manages the property and
> operational process.
>
> **How do the properties generate income?** The properties are rented to guests on a
> daily or short-term basis. Guest bookings generate rental income, which forms part of
> the income distributed to investors according to the applicable investment terms.
>
> **Are the properties insured?** Our underlying properties are insured against covered
> risks, providing an additional layer of protection for the assets.

**Closing CTA**
> **REAL ESTATE IS AT THE HEART OF WHAT WE DO.**
>
> From carefully selected properties to professional management and guest
> accommodation, Keystone REIT is focused on putting real estate to productive use.
>
> Participation starts from $200.
>
> Explore the investment plans and discover how you can participate in the Keystone REIT
> model.
>
> **[VIEW INVESTMENT PLANS]**   **[GET STARTED]**

---

## 10. Route: `/properties/serviced-apartments` — Serviced Apartments

**Intro**
> **QUALITY SPACES. REAL PROPERTY. INCOME-GENERATING POTENTIAL.**
>
> Professionally managed serviced apartments designed for modern short-term living.
>
> Keystone REIT focuses on acquiring, furnishing, and professionally managing serviced
> apartments that provide comfortable, high-quality accommodation for guests while
> forming an important part of our real estate portfolio.
>
> Through our property-focused approach, we transform carefully selected spaces into
> attractive accommodation that can generate rental income through short-term stays.
>
> Real property. Professional management. A smarter way to participate in real estate.
>
> **[EXPLORE OUR PROPERTIES]**

**Our Serviced Apartment Model**
> **FROM PROPERTY ACQUISITION TO GUEST EXPERIENCE**
>
> A successful serviced apartment is about more than owning a space. It requires the
> right property, thoughtful furnishing, professional management, and consistent
> attention to the guest experience.
>
> At Keystone REIT, we manage the process with a clear focus on creating functional and
> attractive accommodation that meets the needs of today's short-term guests.
>
> - **Property Selection** — We identify suitable property opportunities based on
>   factors such as location, accessibility, demand, property quality, and
>   income-generating potential.
> - **Furnishing & Preparation** — Selected properties are furnished and prepared to
>   provide guests with a comfortable, practical, and welcoming environment.
> - **Professional Operations** — Our properties are professionally managed, with
>   attention given to bookings, guest experience, property maintenance, and day-to-day
>   operations.
> - **Rental Activity** — The completed apartments are made available to guests for
>   daily and short-term stays, creating rental activity from the underlying real
>   estate.

**Designed For Modern Living**
> **MORE THAN AN APARTMENT. A COMPLETE STAY.**
>
> Our serviced apartments are designed around what today's guests value:
> - **Comfortable Living Spaces** — Thoughtfully arranged spaces designed for relaxation
>   and convenience.
> - **Modern Furnishings** — Practical and attractive furnishings that create a
>   welcoming environment.
> - **Convenient Locations** — Properties selected with accessibility and guest demand
>   in mind.
> - **Short-Term Flexibility** — Accommodation suitable for guests looking for
>   alternatives to traditional hotels.
> - **Professional Management** — Properties maintained and managed with a focus on
>   quality and consistency.

**Why Serviced Apartments?**
> **A PROPERTY MODEL BUILT AROUND DEMAND.**
>
> Serviced apartments combine the comfort and privacy of an apartment with the
> convenience associated with short-term accommodation.
>
> For guests, they offer an alternative to traditional hotel stays. For property
> operators, they provide an opportunity to generate rental income through short-term
> occupancy. For Keystone REIT, they form an important part of our strategy for
> participating in income-generating real estate.
>
> WE FOCUS ON PROPERTIES WITH PURPOSE. We look for opportunities where quality
> accommodation, location, and market demand can come together to create sustainable
> rental activity.

**Our Property Selection Approach**
> **WE LOOK BEYOND THE FOUR WALLS.**
>
> Before a property becomes part of our portfolio, we consider several important
> factors:
> - **Location** — Accessibility, surrounding amenities, neighbourhood characteristics,
>   and proximity to areas that attract guests.
> - **Property Quality** — The condition, layout, functionality, and suitability of the
>   property for serviced accommodation.
> - **Market Demand** — The potential demand for short-term accommodation within the
>   property's market.
> - **Operating Potential** — The property's suitability for efficient management, guest
>   turnover, maintenance, and ongoing operations.
> - **Income Potential** — The potential for the property to generate rental activity
>   based on relevant market conditions.
>
> Our objective is to build a portfolio around properties that make commercial and
> operational sense.

**Property Management**
> **WE TAKE THE WORK OUT OF PROPERTY OPERATIONS.**
>
> Managing short-term accommodation requires constant attention. From guest bookings and
> communication to cleaning, maintenance, and property presentation, every detail
> contributes to the performance and reputation of a property.
>
> Keystone REIT handles the operational side of our properties so that the real estate
> can be professionally managed throughout its rental lifecycle.
>
> Property acquisition. Furnishing. Guest management. Maintenance. Operations. Rental
> activity. One professionally managed process.

**Built Around Real Property**
> **THE REAL ESTATE BEHIND THE MODEL**
>
> Our serviced apartments are not simply accommodation units. They are real properties
> forming part of the underlying real estate strategy of Keystone REIT.
>
> Capital is deployed toward acquiring and furnishing suitable properties, which are
> then operated as short-term accommodation.
>
> THE MODEL IS SIMPLE: Capital → Property Acquisition → Furnishing → Guest Accommodation
> → Rental Activity → Investor Distributions
>
> Income generated from the properties is distributed to investors as dividends
> according to their investment amount and the applicable investment terms.

**Protection Of Underlying Assets**
> **PROPERTY PROTECTION MATTERS.**
>
> We understand the importance of protecting the real estate supporting our model. Our
> properties are insured against covered risks, providing an additional layer of
> protection for the underlying assets.
>
> Keystone REIT combines property acquisition with professional management and
> responsible asset oversight.

**Explore Our Property Portfolio**
> **SEE WHERE THE REAL ESTATE TAKES PLACE.**
>
> Explore the serviced apartments that form part of the Keystone REIT property
> portfolio. Each property represents a real asset, a real location, and an opportunity
> to create rental activity through professionally managed short-term accommodation.
>
> **[VIEW PROPERTY PORTFOLIO]** → links to `/properties/portfolio`

**Closing section**
> **YOUR PARTICIPATION STARTS WITH REAL PROPERTY — YOU DON'T HAVE TO BUY AN ENTIRE
> APARTMENT TO PARTICIPATE IN REAL ESTATE.**
>
> Keystone REIT provides an accessible way to participate in professionally managed real
> estate, with investment opportunities starting from $200.
>
> Plan-dependent weekly ROI: 4–8%.
>
> Explore our investment plans and discover how you can participate in the Keystone REIT
> model.
>
> **[VIEW INVESTMENT PLANS]**   **[GET STARTED]**

**Page FAQ**
> **What are Keystone REIT's serviced apartments?** They are furnished residential
> properties operated as short-term accommodation for guests. These properties form
> part of Keystone REIT's real estate portfolio.
>
> **How are the apartments used?** The apartments are made available to guests on a
> daily or short-term basis, creating rental activity from the underlying properties.
>
> **Does Keystone REIT manage the properties?** Yes. Keystone REIT professionally
> manages the property and operational process associated with the serviced apartments.
>
> **How are the properties selected?** We consider factors including location,
> accessibility, property quality, market demand, operational suitability, and
> income-generating potential.
>
> **Are the properties insured?** Our properties are insured against covered risks,
> providing an additional layer of protection for the underlying assets.
>
> **Can I invest in a specific apartment?** Participation is structured through Keystone
> REIT's investment model rather than requiring investors to individually purchase or
> manage a specific apartment. Please review the applicable investment plan and terms
> for details.

**Final CTA**
> **REAL ESTATE. MADE MORE ACCESSIBLE.**
>
> Behind every Keystone REIT opportunity is a real property strategy built around
> professionally managed serviced apartments and short-term rental accommodation.
>
> Start your real estate participation journey from $200.
>
> **[EXPLORE INVESTMENT PLANS]**   **[GET STARTED]**

---

## 11. Route: `/properties/portfolio` — Property Portfolio

Combine the strategy narrative (first half of this page) with the actual city-by-city
grid (second half) as one page — the grid is the "Portfolio Transparency" section made
concrete.

**Hero**
> **REAL ESTATE WITH PURPOSE.**
>
> Explore the properties behind the Keystone REIT model.
>
> Keystone REIT focuses on acquiring, furnishing, and professionally managing serviced
> apartments and short-term rental properties designed to generate rental income.
>
> Through our structured approach, pooled capital is deployed toward real estate assets
> with the potential to create recurring income through guest accommodation.
>
> Real property. Professional management. Accessible participation.
>
> **[VIEW INVESTMENT PLANS]**

**Our Property Strategy**
> **SELECTED FOR INCOME POTENTIAL. MANAGED FOR PERFORMANCE.**
>
> Our property strategy is centered around real estate that can serve the growing
> demand for quality, flexible accommodation. We focus on serviced apartments and
> short-term rental properties that combine attractive locations, quality furnishings,
> practical amenities, and strong guest appeal.
>
> Each property forms part of a broader strategy designed to transform real estate into
> an actively managed income-generating business.
>
> **Our Approach:** Property Selection (identify properties supporting strong rental
> demand and long-term commercial potential) → Acquisition & Preparation (acquire and
> furnish to create comfortable, attractive spaces) → Professional Management (maintain
> quality, support guest satisfaction, optimize operations) → Income Generation
> (available to guests daily/short-term, generating rental income).

**What We Focus On**
> **SERVICED APARTMENTS & SHORT-TERM RENTALS**
>
> Our portfolio focuses primarily on:
> - **Serviced Apartments** — Fully furnished residential spaces designed to provide
>   guests with the comfort and convenience of a home combined with the services
>   expected from quality accommodation.
> - **Short-Term Rental Properties** — Properties operated for daily and short-term
>   stays, serving guests seeking flexible accommodation for business, leisure,
>   relocation, and other temporary needs.
> - **Income-Generating Real Estate** — Our focus is not simply on owning property. We
>   focus on properties that can be actively operated to generate rental income.

**What Makes A Property Attractive?**
> **WE LOOK BEYOND THE FOUR WALLS.**
>
> A successful rental property is about more than the building itself. When evaluating
> potential properties, we consider:
> - **Location** — Accessibility, surrounding infrastructure, neighborhood appeal, and
>   proximity to key destinations.
> - **Demand** — The potential for consistent demand from short-term and
>   serviced-apartment guests.
> - **Property Quality** — The condition, layout, functionality, and overall suitability
>   of the property.
> - **Guest Experience** — Features, furnishings, amenities, and presentation that can
>   make a property attractive to guests.
> - **Rental Potential** — The property's potential to generate sustainable rental
>   income under the right operating conditions.
> - **Long-Term Value** — The broader potential of the property and its surrounding
>   market.

**Our Property Lifecycle**
> **FROM PROPERTY SELECTION TO GUEST STAY.**
>
> **01 — IDENTIFY** (potential opportunities identified and assessed) → **02 — SELECT**
> (evaluated on location, quality, demand, commercial potential) → **03 — ACQUIRE**
> (suitable properties acquired through the Keystone REIT structure) → **04 — FURNISH**
> (professionally prepared and furnished for the intended rental market) → **05 —
> OPERATE** (placed into operation, made available to guests) → **06 — MANAGE**
> (day-to-day operations professionally managed) → **07 — DISTRIBUTE** (income
> distributed to investors as dividends per investment amount and applicable terms).

**Portfolio Transparency → Property Showcase Grid**
> **KNOW WHAT STANDS BEHIND THE MODEL.**
>
> We believe confidence starts with transparency. As Keystone REIT grows, our property
> portfolio provides greater visibility into the real estate assets supporting our
> business model. Individual property profiles include property type, location, key
> features/amenities, and operational status.

Render the ten properties below as portfolio cards (image placeholder + the fields
given). **`Status` is a literal placeholder in the source copy** — `[Active / Under
Management / Coming Soon]` — pick and set a real status per property when this page is
built rather than shipping the bracketed placeholder text.

1. **Miami, Florida, USA** — Modern Serviced Apartment. Type: Serviced Apartment · Use:
   Short-Term Accommodation. *A professionally furnished apartment positioned in one of
   the world's most recognized destinations for leisure, business, and short-term
   accommodation.* Highlights: Modern interior, Fully furnished, Guest-ready
   accommodation, Short-term rental focused, Professionally managed. **[VIEW PROPERTY]**

2. **Dallas, Texas, USA** — Contemporary Urban Apartment. Type: Serviced Apartment ·
   Use: Short-Term Accommodation. *A contemporary residential property designed to
   provide comfortable short-term accommodation in a major U.S. metropolitan market.*
   Highlights: Contemporary design, Fully furnished, Comfortable living spaces,
   Strategic urban location, Professionally managed. **[VIEW PROPERTY]**

3. **London, United Kingdom** — Premium City Apartment. Type: Serviced Apartment · Use:
   Short-Term Accommodation. *A professionally prepared apartment in one of Europe's
   most established global cities, serving business and leisure travelers seeking
   quality short-term accommodation.* Highlights: Premium furnished interior,
   City-focused accommodation, Guest-ready, Short-term rental potential, Professionally
   managed. **[VIEW PROPERTY]**

4. **Manchester, United Kingdom** — Modern City Living. Type: Serviced Apartment · Use:
   Short-Term Accommodation. *A modern serviced apartment positioned within a dynamic UK
   city with a strong mix of business, leisure, and residential demand.* Highlights:
   Modern furnishings, Comfortable accommodation, Convenient location, Guest-focused
   setup, Professionally managed. **[VIEW PROPERTY]**

5. **Toronto, Ontario, Canada** — Premium Urban Retreat. Type: Serviced Apartment · Use:
   Short-Term Accommodation. *A contemporary apartment offering a comfortable base for
   guests visiting one of Canada's leading business and cultural destinations.*
   Highlights: Contemporary interiors, Fully furnished, Short-term accommodation,
   Guest-ready, Professionally managed. **[VIEW PROPERTY]**

6. **Dubai, United Arab Emirates** — Luxury Serviced Apartment. Type: Serviced Apartment
   · Use: Short-Term Accommodation. *A premium serviced apartment designed around the
   expectations of guests visiting one of the world's leading destinations for tourism,
   business, and luxury accommodation.* Highlights: Premium interior, Modern
   furnishings, Guest-focused design, Short-term rental focused, Professionally managed.
   **[VIEW PROPERTY]**

7. **Abu Dhabi, United Arab Emirates** — Executive Serviced Apartment. Type: Serviced
   Apartment · Use: Short-Term Accommodation. *A professionally furnished apartment
   designed to provide a comfortable and convenient accommodation experience for
   business and leisure guests.* Highlights: Executive-style accommodation, Fully
   furnished, Modern living spaces, Guest-ready, Professionally managed. **[VIEW
   PROPERTY]**

8. **Paris, France** — Elegant City Apartment. Type: Serviced Apartment · Use:
   Short-Term Accommodation. *A thoughtfully furnished apartment designed to combine
   comfort and functionality for guests experiencing one of Europe's most visited
   cities.* Highlights: Elegant interior, Fully furnished, Short-term accommodation,
   Guest-focused setup, Professionally managed. **[VIEW PROPERTY]**

9. **Lisbon, Portugal** — Contemporary City Retreat. Type: Serviced Apartment · Use:
   Short-Term Accommodation. *A contemporary serviced apartment positioned for guests
   seeking comfortable short-term accommodation in a major European destination.*
   Highlights: Modern design, Fully furnished, Comfortable living environment,
   Guest-ready, Professionally managed. **[VIEW PROPERTY]**

10. **Cape Town, South Africa** — Premium Serviced Apartment. Type: Serviced Apartment ·
    Use: Short-Term Accommodation. *A professionally furnished property designed to
    provide quality short-term accommodation in one of Africa's most prominent tourism
    and business destinations.* Highlights: Premium furnishings, Modern accommodation,
    Short-term rental focused, Guest-ready, Professionally managed. **[VIEW PROPERTY]**

**A Growing Global Portfolio (closing narrative)**
> **PROPERTY. LOCATION. OPPORTUNITY.**
>
> Our portfolio reflects Keystone REIT's focus on professionally managed serviced
> apartments and short-term rental properties across selected markets. From North
> America and Europe to the Middle East and Africa, we continue to focus on real estate
> opportunities where quality accommodation and guest demand can support our operating
> model.
>
> Explore the properties behind the Keystone REIT model.
>
> **[VIEW ALL PROPERTIES]**   **[EXPLORE INVESTMENT PLANS]**

**Insurance & Asset Protection**
> **ADDITIONAL PROTECTION FOR THE UNDERLYING ASSETS.**
>
> Our properties are insured against covered risks, providing an additional layer of
> protection for the underlying real estate assets. We recognize that responsible
> property management extends beyond generating rental income — it also means taking
> appropriate steps to protect and maintain the assets supporting the business.

**A Growing Portfolio (secondary closing block from the strategy doc — fold into the
section above rather than repeating two near-identical closers)**
> Keystone REIT is focused on building a portfolio of quality income-generating
> properties over time. As the platform grows, we aim to identify additional
> opportunities across suitable real estate markets and expand the portfolio
> responsibly.
>
> MORE PROPERTIES. MORE OPPORTUNITIES. ONE PROFESSIONAL APPROACH.

**Footer CTA**
> **REAL ESTATE. MADE MORE ACCESSIBLE.**
>
> Keystone REIT — Registration No. 11793537
>
> Investment opportunities starting from $200. Weekly ROI: 4–8%, depending on the
> selected investment plan.
>
> **[GET STARTED]**

---

## 12. Route: `/faq` — FAQs (full page)

Group into the same categories as the source copy — render as an accordion, grouped
under visible category headers (About Keystone REIT, How It Works, Investment Plans,
Properties, Security & Trust, Getting Started), per `04-public-website.md`'s FAQ
guidance.

**About Keystone REIT**

> **What is Keystone REIT?** Keystone REIT provides an accessible way for investors to
> participate in professionally managed real estate through a mutual fund structure.
> Funds are pooled and used to acquire and furnish serviced apartments and short-term
> rental properties, including Airbnb-style apartments. These properties are then
> operated and rented to guests to generate rental income. The income generated from the
> properties is distributed to investors as dividends based on their investment amount
> and the applicable terms of the investment.
>
> **What does Keystone REIT actually do?** Keystone REIT focuses on acquiring,
> furnishing, and professionally managing serviced apartments and short-term rental
> properties. Our role is to manage the real estate and its operations while providing
> investors with a structured way to participate in the underlying real estate activity.
>
> **Is Keystone REIT a real estate company or an investment platform?** Keystone REIT
> combines real estate operations with an investment participation model. The underlying
> activity is centered around real properties, particularly serviced apartments and
> short-term rental accommodation, while the mutual fund structure provides a way for
> investors to participate without having to personally acquire or manage an entire
> property.

**How It Works**

> **How does Keystone REIT work?** The process is designed to be straightforward: (1)
> Funds are pooled through our mutual fund structure. (2) The capital is used to acquire
> and prepare suitable serviced apartments and short-term rental properties. (3) The
> apartments are made available to guests on a daily or short-term basis. (4) Guest
> bookings generate rental income from the properties. (5) Generated income is
> distributed to investors as dividends according to their investment amount and the
> applicable terms of their selected plan.
>
> **Do I need to buy an entire property?** No. Keystone REIT is designed to provide a
> more accessible way to participate in real estate without requiring an individual to
> purchase an entire property. Investment opportunities start from $200.
>
> **Do I have to find or manage a property myself?** No. Keystone REIT handles the
> professional management of the properties and the associated investment process. This
> includes property acquisition, furnishing, preparation, and day-to-day rental
> operations.
>
> **How is the rental income generated?** Our serviced apartments and short-term rental
> properties are made available to guests on a daily or short-term basis. Guest bookings
> generate rental income, which forms part of the income distributed to investors
> according to the applicable investment terms.

**Investment Plans**

> **How much do I need to start?** Investment opportunities with Keystone REIT start
> from $200. The minimum amount may vary depending on the available investment plan.
>
> **What is the weekly ROI?** The stated weekly ROI ranges from 4–8% depending on the
> selected investment plan. The applicable rate, duration, distribution structure, and
> other conditions depend on the specific plan selected. Returns are not guaranteed and
> are subject to the applicable investment terms and risks.
>
> **Are the returns guaranteed?** No. Investment returns are not guaranteed. The
> applicable return or distribution depends on the selected investment plan and its
> terms, as well as the performance of the underlying investment activities. Investors
> should review the relevant investment information and terms before participating.
>
> **How are dividends calculated?** Dividends are determined based on the investor's
> investment amount and the applicable terms of the selected investment plan. The
> specific calculation and distribution schedule will be provided as part of the
> relevant investment plan information.
>
> **How often are distributions made?** Distribution frequency depends on the specific
> investment plan selected. Please review the terms of your chosen plan for the
> applicable distribution schedule.
>
> **Can I choose which property my funds are invested in?** Investment allocation
> depends on the structure and terms of the applicable investment plan. Where individual
> property selection is not offered, funds may be allocated across qualifying properties
> within the Keystone REIT portfolio.
>
> **Can I increase my investment later?** This depends on the terms and availability of
> the selected investment plan. Please contact our support team for information about
> adding to an existing participation.

**Properties**

> **What types of properties does Keystone REIT acquire?** Our focus is on serviced
> apartments and short-term rental properties, including Airbnb-style apartments. We
> seek properties that can be professionally prepared and operated as quality
> short-term accommodation.
>
> **Where are Keystone REIT properties located?** Property locations may vary as the
> portfolio develops. Details of properties currently available within the Keystone
> REIT portfolio will be provided through the relevant property or investment
> information.
>
> **How are properties selected?** Properties are selected based on factors relevant to
> their suitability for short-term accommodation and their potential to generate rental
> income. This may include location, property quality, guest demand, operating
> considerations, and other factors relevant to the property's performance.
>
> **Who manages the properties?** Keystone REIT and its appointed property management
> and operational partners oversee the management of the properties. This includes
> preparing the properties for guests and managing the day-to-day rental activities.
>
> **Are the properties insured?** Yes. Our underlying properties are insured against
> covered risks, providing an additional layer of protection for the assets supporting
> the business. Insurance coverage is subject to the applicable policy terms,
> conditions, exclusions, and limits.

**Security & Trust**

> **How can I verify Keystone REIT?** Keystone REIT's registration number is 11793537.
> Additional company and investment information is available throughout our website.
>
> **Is my money directly used to buy a property?** Funds are pooled through the mutual
> fund structure and deployed according to the applicable investment structure and
> terms. The capital is used toward the acquisition, furnishing, and operation of
> qualifying real estate assets.
>
> **What happens if a property is not occupied?** Short-term rental performance can vary
> depending on factors such as demand, seasonality, location, pricing, and operating
> conditions. Property operations are professionally managed with the objective of
> maintaining occupancy and generating rental income. Investment returns are therefore
> not guaranteed.
>
> **What risks should I consider?** As with any investment, participation in real
> estate involves risk. Property values, occupancy levels, rental demand, operating
> costs, market conditions, and other factors can affect performance. Investors should
> carefully review all applicable investment information and terms and consider whether
> the investment is suitable for them before participating.

**Getting Started**

> **How do I get started with Keystone REIT?** (1) Explore the available investment
> plans. (2) Select the plan that suits your objectives. (3) Review the applicable terms
> and information. (4) Complete the registration process. (5) Follow the instructions to
> participate. **[VIEW INVESTMENT PLANS]**
>
> **What information do I need to register?** The registration process may require
> personal and identification information necessary to create and maintain your account
> and comply with applicable requirements. The exact information required will be shown
> during registration.
>
> **Can I invest from outside my country?** Availability may depend on applicable laws,
> regulations, eligibility requirements, and the terms of the relevant investment plan.
> Please contact Keystone REIT before participating if you are unsure whether you are
> eligible.
>
> **How can I contact Keystone REIT?** For questions that aren't answered on this page,
> please contact our support team through the Contact Us page. **[CONTACT US]**

**Page intro & closing copy**
> **EVERYTHING YOU NEED TO KNOW ABOUT KEYSTONE REIT**
>
> Whether you're discovering Keystone REIT for the first time or you're ready to get
> started, we've answered some of the most common questions about our real estate
> participation model, investment plans, properties, and how the process works.
>
> If you don't find the answer you're looking for, please contact our support team.
>
> ...
>
> **STILL HAVE QUESTIONS?** We're here to help. If you have a question about Keystone
> REIT, our investment plans, properties, or how the model works, our team is available
> to provide further information. Your real estate journey starts with understanding the
> opportunity.
>
> **[GET STARTED]**   **[CONTACT US]**

---

## 13. Route: `/resources/real-estate-insights` — Real Estate Insights

**Intro**
> **UNDERSTAND REAL ESTATE. MAKE MORE INFORMED DECISIONS.**
>
> Knowledge is the foundation of every smart investment decision.
>
> Real estate can be a powerful asset class, but understanding how it works is just as
> important as participating in it.
>
> At Keystone REIT, we believe investors should have access to clear, practical
> information that helps them understand real estate, rental properties, investment
> structures, and the opportunities within the property market.
>
> Welcome to Keystone REIT Real Estate Insights—your resource for learning more about
> the world of real estate.

**Explore The World Of Real Estate (topic index — build as linked cards; these are topic
categories, not individual articles, for the MVP)**
> - **Real Estate Basics** — Learn how real estate works, how properties can generate
>   income, and the key factors that influence property value and rental demand.
> - **Serviced Apartments** — Discover how serviced apartments work, why they are
>   increasingly used for short-term accommodation, and how professionally managed
>   properties can generate rental income.
> - **Short-Term Rentals** — Learn about the short-term rental market, guest
>   accommodation, occupancy, rental demand, and the factors that influence property
>   performance.
> - **Real Estate Participation** — Real estate participation doesn't always require
>   purchasing an entire property. Learn how pooled capital and professionally managed
>   real estate structures can provide alternative ways to participate in the property
>   market.
> - **Property Management** — A property is only part of the equation. Effective
>   management plays an important role in maintaining the property, attracting guests,
>   managing operations, and supporting rental performance.
> - **Investment Education** — Understand important investment concepts, including risk,
>   diversification, investment terms, distributions, and the importance of making
>   informed decisions.

**Why Real Estate Matters**
> **REAL ASSETS. REAL ECONOMIC ACTIVITY. REAL OPPORTUNITY.**
>
> Real estate plays an important role in economies around the world. People need places
> to live, work, stay, and conduct business. This creates ongoing demand for different
> types of property and accommodation.
>
> For investors, real estate can provide exposure to an asset class that can generate
> income through rental activity while also having underlying property value. However,
> every investment comes with risks, and understanding those risks is an important part
> of responsible investing.

**Understanding Income-Generating Property**
> **HOW DOES A PROPERTY GENERATE INCOME?**
>
> The basic concept is simple: Property → Guests/Tenants → Rental Activity → Revenue.
>
> For serviced apartments and short-term rentals, properties can be made available to
> guests on a daily or short-term basis. Revenue generated from rental activity can then
> contribute to the overall financial performance of the property operation.
>
> At Keystone REIT, our model focuses on acquiring, furnishing, and professionally
> managing serviced apartments and short-term rental properties.

**What Makes A Property Attractive?**
> **Location** — can influence demand, accessibility, rental rates, and the type of
> guests a property attracts.
>
> **Property Quality** — well-presented, properly furnished, and professionally
> maintained properties can provide a better experience for guests.
>
> **Demand** — understanding who needs accommodation and why they choose a particular
> location is an important part of evaluating a property opportunity.
>
> **Management** — strong property management helps coordinate operations, maintenance,
> guest experience, and day-to-day activities.
>
> **Operating Costs** — revenue is only one side of the equation; expenses associated
> with maintaining and operating a property also need to be considered.

**Why Property Management Matters**
> **GREAT PROPERTY. GREAT MANAGEMENT.**
>
> Owning or participating in a property opportunity is only one part of the process.
> Serviced apartments and short-term rentals require ongoing management—from preparing
> the property and maintaining its condition to handling guest-related operations.
>
> Professional management helps create an organized system around these activities. At
> Keystone REIT, we manage the property process so investors can participate without
> having to personally manage the day-to-day operations.

**Understanding Risk**
> **EVERY INVESTMENT DESERVES A CLOSER LOOK.**
>
> Real estate can offer opportunities, but it is not risk-free. Property performance can
> be affected by factors such as occupancy levels, operating expenses, market
> conditions, location, maintenance costs, and changes in demand.
>
> This is why understanding an investment before participating is essential. Keystone
> REIT encourages investors to review the applicable investment information, terms,
> duration, distribution structure, and associated risks before making a decision.

**Keystone REIT's Approach (recap block)**
> **MAKING REAL ESTATE PARTICIPATION MORE ACCESSIBLE**
>
> Keystone REIT provides an accessible way to participate in professionally managed real
> estate through a mutual fund structure. Funds from investors are pooled and used to
> acquire and furnish serviced apartments and short-term rental properties. The
> properties are then operated and rented to guests, generating rental income. Income
> generated from the properties is distributed to investors as dividends based on their
> investment amount and applicable investment terms.
>
> Investment opportunities start from $200. Plan-dependent weekly ROI: 4–8%.
>
> **[EXPLORE INVESTMENT PLANS]**

**Closing**
> **KEEP LEARNING — YOUR KNOWLEDGE IS PART OF YOUR INVESTMENT JOURNEY.**
>
> The more you understand about real estate, the better positioned you are to evaluate
> opportunities and ask the right questions.
>
> Explore our latest insights and educational resources to continue building your
> understanding of real estate.
>
> **[EXPLORE ALL INSIGHTS]**   **[VIEW INVESTMENT GUIDE]**   **[EXPLORE FAQs]**
>
> **READY TO EXPLORE REAL ESTATE? START WITH KNOWLEDGE. MOVE WITH CONFIDENCE.**
>
> Discover a more accessible way to participate in professionally managed real estate.
> Start from $200 with Keystone REIT.
>
> **[GET STARTED]**

---

## 14. Route: `/resources/investment-guide` — Investment Guide

**Intro**
> **A SIMPLE GUIDE TO PARTICIPATING IN REAL ESTATE WITH KEYSTONE REIT**
>
> Real estate participation doesn't have to be complicated.
>
> Keystone REIT provides an accessible way to participate in professionally managed
> real estate, with investment opportunities starting from $200.
>
> Through our mutual fund structure, funds from investors are pooled and deployed toward
> acquiring and furnishing serviced apartments and short-term rental properties.
>
> These properties are professionally managed and rented to guests, generating rental
> income that is distributed to investors as dividends according to their investment
> amount and the applicable terms of their selected plan.
>
> Here's how it works.

**Guide steps**

> **01 — Understand The Model** — Keystone REIT brings investors together through a
> structured mutual fund model. Rather than requiring each person to purchase and manage
> an entire apartment independently, funds are pooled and used toward real estate
> opportunities selected and managed by Keystone REIT. This provides a more accessible
> way to participate in the real estate market.
>
> **02 — Capital Is Deployed Into Real Estate** — The pooled capital is used to acquire
> and furnish suitable serviced apartments and short-term rental properties, including
> Airbnb-style apartments. Our focus is on properties with the potential to generate
> rental income through short-term accommodation. The model is built around real
> property and real rental activity.
>
> **03 — Properties Are Operated** — Once properties are acquired and prepared, they are
> made available to guests on a daily or short-term basis. Keystone REIT manages the
> property operations, helping take care of the processes involved in running the
> accommodation. This means investors do not have to personally source properties,
> furnish apartments, manage guests, or handle the day-to-day operation of the
> properties.
>
> **04 — Rental Income Is Generated** — Guests pay for their accommodation, creating
> rental income from the properties. The income generated from the properties forms the
> basis for distributions to investors, according to their investment amount and the
> applicable terms of the selected investment plan.
>
> **05 — Investor Distributions** — Income generated from the properties is distributed
> to investors as dividends in accordance with the applicable investment terms. Keystone
> REIT currently offers plans with plan-dependent weekly ROI of 4–8%. The applicable
> rate, duration, distribution structure, and other conditions depend on the specific
> investment plan selected. Always review the details of a plan before participating.

**Starting From $200**
> **REAL ESTATE PARTICIPATION WITH A LOWER ENTRY POINT**
>
> One of the biggest barriers to real estate participation is the amount of capital
> traditionally required to get started. Keystone REIT provides investment opportunities
> starting from $200, allowing more people to access a professionally managed real
> estate participation model.
>
> You don't need to purchase an entire apartment to participate.
>
> **[VIEW INVESTMENT PLANS]**

**What Happens To The Capital? (flow)**
> Pooled Capital → Property Acquisition → Furnishing & Preparation → Property
> Operations → Rental Income → Investor Distributions

**Choosing An Investment Plan**
> **FIND THE OPTION THAT FITS YOUR GOALS**
>
> Before participating, review the available investment plans carefully. Each plan may
> have different: minimum participation amount, duration, ROI, distribution structure,
> applicable terms and conditions.
>
> Current plan range — Starting from: $200 · Plan-dependent weekly ROI: 4–8%.
>
> The specific terms displayed for each plan should be reviewed before making a
> decision.
>
> **[VIEW ALL INVESTMENT PLANS]**

**Why Participate Through Keystone REIT?**
> **WE HANDLE THE PROPERTY SIDE. YOU PARTICIPATE IN THE OPPORTUNITY.**
>
> Property Sourcing, Property Preparation, Guest Accommodation, Property Management,
> Income Distribution — all handled by Keystone REIT (same five-item structure as
> `/investment-plans`, §8 above — reuse the same component rather than re-authoring it).

**Asset Protection**
> **YOUR PARTICIPATION IS BUILT AROUND REAL PROPERTY**
>
> Keystone REIT's underlying properties are insured against covered risks, providing an
> additional layer of protection for the assets supporting the business. Insurance does
> not eliminate investment risk, but it provides additional protection against covered
> risks affecting insured properties.

**Who Is This For?**
> Keystone REIT may be suitable for individuals who want to participate in real estate
> without personally handling the acquisition, furnishing, guest management, and daily
> operation of short-term rental properties. It can be an option for people who: want to
> start with a smaller amount of capital; want exposure to a professionally managed real
> estate model; prefer not to manage a property themselves; want to explore an
> alternative way to participate in real estate.

**Before You Get Started**
> **MAKE AN INFORMED DECISION**
>
> Before selecting an investment plan, take time to understand: (1) The investment
> amount — know the minimum required for your preferred plan. (2) The expected ROI —
> understand the applicable rate and how it is calculated. (3) The investment duration —
> review how long your participation remains active. (4) The distribution terms —
> understand when and how distributions are made. (5) The applicable terms and
> conditions — read all relevant information before confirming your participation.
>
> Investing should always be a considered decision.

**Your First Step Is Simple**
> **READY TO EXPLORE REAL ESTATE PARTICIPATION?**
>
> Start by reviewing the available investment plans and selecting the option that
> aligns with your goals and preferences.
>
> Starting from $200. Plan-dependent weekly ROI of 4–8%.
>
> Explore the plans. Understand the terms. Choose your preferred option.
>
> **[VIEW INVESTMENT PLANS]**   **[GET STARTED]**

**Page FAQ**
> **What is the minimum amount required?** Investment opportunities with Keystone REIT
> start from $200.
>
> **Where does the pooled capital go?** Funds are pooled through our mutual fund
> structure and deployed toward acquiring and furnishing serviced apartments and
> short-term rental properties.
>
> **How do the properties generate income?** The properties are rented to guests on a
> daily or short-term basis, generating rental income.
>
> **Do I have to manage a property myself?** No. Keystone REIT professionally manages
> the property and investment process.
>
> **How are investors paid?** Income generated from the properties is distributed to
> investors as dividends according to their investment amount and the applicable terms
> of their selected plan.
>
> **What is the ROI?** The available plans have a plan-dependent weekly ROI of 4–8%. The
> applicable rate depends on the selected plan and its terms.
>
> **Are the properties insured?** Yes. The underlying properties are insured against
> covered risks.

**Closing**
> **KEYSTONE REIT — REAL ESTATE. MADE MORE ACCESSIBLE.**
>
> Participate in professionally managed real estate through serviced apartments and
> short-term rental properties. Starting from $200. Registration No.: 11793537.
>
> **[VIEW INVESTMENT PLANS]**   **[CONTACT US]**

---

## 15. Route: `/contact` — Contact

**No copy was supplied for this page.** Do not fabricate marketing copy for it. Build the
functional pieces per `04-public-website.md` (a contact form → Convex mutation → Resend
notification, per Phase 7), with minimal, plain framing copy such as a simple "Get in
Touch" heading and a short one-line description — flag this to the team as a page still
needing authored copy rather than shipping invented brand voice text.

---

## 16. Cross-page consistency notes for whoever builds this

- **Repeated modules** appear near-verbatim across many pages (the 4/5/6-step "how it
  works" flow, the "why participate through Keystone REIT" five-item list, the
  properties-are-insured line, the plan comparison table). Build these as **shared
  components** (`<HowItWorksSteps />`, `<WhyParticipateGrid />`, `<InsuranceNotice />`,
  `<PlanComparisonTable />`) populated with the copy given once, and reuse them across
  routes — do not hand-copy the same paragraph into six different page files.
- **CTA button labels are inconsistent in the source copy on purpose** (e.g. "GET
  STARTED" vs "GET STARTED FROM $200" vs "START INVESTING NOW") — preserve each page's
  specific label exactly as given above; don't normalize them all to one string.
- **Returns are explicitly stated as not guaranteed** in multiple places (Investment
  Plans, FAQ, Why Keystone REIT). Keep this disclosure visible near every ROI figure
  shown anywhere in the UI, not just on the pages where it's spelled out above — this is
  a real regulatory-flavored disclosure, not filler copy to trim for brevity.
- **Registration No. 11793537** and the insurance-of-underlying-properties line appear
  everywhere trust is being established — treat both as fixed brand facts to surface
  consistently (e.g. in the footer and on `/about`, `/about/trust-and-protection`, and
  `/faq`), not just decorative text.
