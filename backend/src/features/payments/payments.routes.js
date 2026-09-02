// Razorpay routes. Mount at /api/payments.
// Order creation is student-authenticated. The webhook is public and is
// authenticated by signature instead - it needs the RAW body, so it must be
// mounted before express.json() or given its own raw parser.
