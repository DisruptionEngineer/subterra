import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export const PLANS = {
  free: {
    name: "Free",
    pipelineLimit: 1,
    reportLimit: 10,
    price: 0,
  },
  starter: {
    name: "Starter",
    pipelineLimit: 3,
    reportLimit: 500,
    price: 29,
    stripePriceId: process.env.STRIPE_PRICE_STARTER,
  },
} as const;

export const OVERAGE_RATE_CENTS = 5; // $0.05 per report overage
