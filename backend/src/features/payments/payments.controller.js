// Razorpay order creation and payment verification for paid events.
// The amount is read from Event.price on the server - never from the request.
// Registration.amountPaid snapshots what was actually charged.
// razorpayOrderId / razorpayPaymentId are sparse-unique indexes, which is the
// idempotency guard against duplicate webhook delivery.
// The Razorpay SDK is not installed yet.
