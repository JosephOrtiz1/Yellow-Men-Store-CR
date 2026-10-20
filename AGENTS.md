# Architecture
- Checkout lives on an authenticated `/checkout` page; the cart drawer only edits cart lines and links there, so checkout is a full-page flow.
- Reuse the shipping form and payment/order status explanations across purchase views to keep validation and customer guidance consistent.
- Use PayPal SDK Buttons for both card (fundingSource card, guest checkout) and account popups because hosted CardFields are unavailable for Costa Rica merchant accounts; create and capture orders on authenticated server functions, and never collect card data in application inputs.