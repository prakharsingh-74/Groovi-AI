import { clerkClient } from "@clerk/nextjs/server";

export interface UserSubscriptionDetails {
    plan: "free" | "pro";
    planName: string;
    status: string;
    isPro: boolean;
    features: string[];
}

/**
 * Queries Clerk Backend API to get the current user's active billing subscription.
 */
export async function getUserSubscriptionPlan(userId: string): Promise<UserSubscriptionDetails> {
    try {
        const client = await clerkClient();
        const sub = await client.billing.getUserBillingSubscription(userId);

        if (!sub || sub.status !== "active") {
            return {
                plan: "free",
                planName: "Free",
                status: sub?.status || "inactive",
                isPro: false,
                features: ["Only 3 Agents"],
            };
        }

        // Find active subscription item
        const activeItem = sub.subscriptionItems?.find((item) => item.status === "active");
        const planName = (activeItem?.plan?.name || "").toLowerCase();
        const planSlug = (activeItem?.plan?.slug || "").toLowerCase();
        const feeAmount = activeItem?.plan?.fee?.amount || 0;

        // User is Pro if plan name or slug contains 'pro', fee > 0, or plan has 'Unlimited Agents' feature
        const features = activeItem?.plan?.features?.map((f) => f.name) || [];
        const hasProFeature = features.some((f) => f.toLowerCase().includes("unlimited") || f.toLowerCase().includes("template"));
        const isPro = planName.includes("pro") || planSlug.includes("pro") || feeAmount > 0 || hasProFeature;

        return {
            plan: isPro ? "pro" : "free",
            planName: activeItem?.plan?.name || (isPro ? "Pro" : "Free"),
            status: sub.status,
            isPro,
            features: features.length > 0 ? features : (isPro ? ["Unlimited Agents", "Priority support", "Template page Access"] : ["Only 3 Agents"]),
        };
    } catch (err: any) {
        // User may not have any billing subscription initialized in Clerk yet
        return {
            plan: "free",
            planName: "Free",
            status: "none",
            isPro: false,
            features: ["Only 3 Agents"],
        };
    }
}
