# FlitStore

FlitStore is a full-stack e-commerce platform built to support both customers and retailers in one application. It includes product browsing, cart and checkout flows, retailer product management, order handling, payments, reviews, coupon support, and interactive shopping features such as AI-style negotiation and AR try-on.

## Project Summary

This project was developed as a working prototype over **1 month**. The goal of the first phase was to deliver a complete, usable storefront with a functional backend, user authentication, order processing, and retailer tools.

After review, the project was extended and refined over an additional **1.5 months** to complete the remaining features, improve the user experience, and stabilize the codebase for testing and deployment.

## What Was Built In 1 Month

The first month focused on building the core product and proving the main user flow end to end.

### Daily Work Plan for 30 Days

**Day 1:** Set up the project structure, install dependencies, and prepare the client and server folders.

**Day 2:** Configure the backend server, database connection, and environment settings.

**Day 3:** Create the main database models for users, products, and orders.

**Day 4:** Set up the frontend routing, layout, and app shell.

**Day 5:** Add Redux store setup and initial state management for auth and cart.

**Day 6:** Build the navigation header, footer, and base responsive layout.

**Day 7:** Create the homepage structure and connect the product listing API.

**Day 8:** Add product cards, product images, and basic search/browse flow.

**Day 9:** Build the product details page with price, rating, and stock display.

**Day 10:** Add add-to-cart functionality and verify cart state updates correctly.

**Day 11:** Create the cart screen with quantity selection and remove-item actions.

**Day 12:** Add user login and registration screens.

**Day 13:** Connect authentication to the backend and protect private routes.

**Day 14:** Add profile-related UI and validate user session persistence.

**Day 15:** Build the shipping screen and collect delivery details.

**Day 16:** Build the payment screen and wire payment method selection.

**Day 17:** Create the place-order screen and calculate final totals.

**Day 18:** Connect order creation to the backend and verify checkout flow.

**Day 19:** Add order history and order detail screen support.

**Day 20:** Build basic review display and review submission flow.

**Day 21:** Start retailer dashboard setup and create the main dashboard layout.

**Day 22:** Add retailer product list and product management actions.

**Day 23:** Add create product form and connect image/category/stock fields.

**Day 24:** Add edit product support and update the backend product APIs.

**Day 25:** Add delete product support and verify product removal flow.

**Day 26:** Add dashboard summary cards and product/order analytics sections.

**Day 27:** Improve styling consistency across the dashboard and product screens.

**Day 28:** Refine checkout, cart, and order display for better user experience.

**Day 29:** Run full manual testing on customer and retailer flows.

**Day 30:** Fix final issues, clean up the codebase, and prepare the first review-ready version.

## Completion Work In 1.5 Months After Review

After the first month was completed and reviewed, the next 1.5 months were used to improve the project, fix gaps, and finalize the experience.

### Review Phase 1: Days 31 to 45

- Strengthened shopping interactions and fixed edge cases in the product flow.
- Refined the negotiation experience so discounted prices are handled consistently.
- Improved product rating display and dashboard styling.
- Ensured deleted products no longer appear in active order flows.
- Unified the light and dark theme behavior across major screens.
- Replaced hardcoded colors with theme-aware styling.
- Improved retailer dashboard readability and card layout consistency.
- Polished responsive behavior for desktop and mobile screens.

### Review Phase 2: Days 46 to 60

- Strengthened order and product handling on the server.
- Added better validation for cart, checkout, and offer-based pricing.
- Verified customer and retailer dashboards update correctly after purchases and deletions.
- Improved the overall data flow between frontend state and backend responses.
- Ran manual testing for login, registration, cart, checkout, and order placement.
- Verified retailer product management and order visibility.
- Checked mobile responsiveness and browser consistency.
- Prepared the deployment checklist and final project notes.

## Final Deliverables

- Customer storefront with product browsing and checkout.
- Retailer dashboard for product and order management.
- Payment and order processing flow.
- Review, coupon, and negotiation-related functionality.
- Responsive UI with theme support.
- Backend APIs, models, and controllers for the full e-commerce flow.

## Tech Stack

- Frontend: React, Vite, Redux Toolkit, React Router, Tailwind CSS
- Backend: Node.js, Express
- Database: MongoDB
- UI/UX: Responsive layouts, theme-based styling, reusable components
- Integrations: Payment flow, charts, AR-related components, and media handling

## Notes For Review

This README is written to show a realistic project timeline:

- **1 month** for the first working version and core delivery
- **1.5 months** for review-driven completion, cleanup, and final polishing

If you want, you can use this text as a project report, internship summary, or portfolio README.
