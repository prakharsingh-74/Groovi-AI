'use client';

import React from 'react';
import { PricingTable } from '@clerk/nextjs';

export default function BillingPage() {
    return (
        <div className="w-full flex justify-center min-h-[calc(100vh-4rem)] bg-background">
            <div className="w-full max-w-4xl px-6 md:px-10 py-10 flex flex-col items-center">
                {/* Header */}
                <div className="w-full max-w-[720px] mb-8 text-left">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Plans &amp; Billing
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1.5 text-base">
                        Choose the plan that&apos;s right for you
                    </p>
                </div>

                {/* Clerk Pricing Table Container with controlled card width & increased height */}
                <div className="w-full max-w-[720px] flex justify-center">
                    <PricingTable
                        appearance={{
                            elements: {
                                pricingTable: "flex justify-center gap-6 w-full",
                                pricingTableCard: "w-full max-w-[330px] min-h-[460px] flex flex-col justify-between p-7",
                                pricingTableCardBody: "flex-1 flex flex-col justify-between my-4",
                            },
                        }}
                    />
                </div>

                {/* Scoped CSS overrides to guarantee reduced width & increased height for Clerk cards */}
                <style jsx global>{`
                    .cl-pricingTable {
                        display: flex !important;
                        justify-content: center !important;
                        gap: 24px !important;
                        width: 100% !important;
                        max-width: 720px !important;
                        margin: 0 auto !important;
                    }
                    .cl-pricingTableCard {
                        width: 100% !important;
                        max-width: 330px !important;
                        min-height: 460px !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        padding: 28px !important;
                        border-radius: 20px !important;
                        transition: all 0.2s ease !important;
                    }
                    .cl-pricingTableCardBody {
                        flex: 1 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        justify-content: space-between !important;
                        margin: 20px 0 !important;
                    }
                    .cl-pricingTableCardFeatures {
                        margin: 16px 0 !important;
                    }
                    .cl-pricingTableCardFeaturesList {
                        gap: 14px !important;
                    }
                `}</style>
            </div>
        </div>
    );
}
