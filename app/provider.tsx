'use client'
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { UserDetailContext } from '@/context/UserDetailContext';
import { useUser } from '@clerk/nextjs';

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const { user, isLoaded, isSignedIn } = useUser();
    const [userDetail, setUserDetail] = useState<any>(null);

    const loadUserDetail = useCallback(async () => {
        if (!isLoaded || !isSignedIn || !user) {
            return;
        }

        try {
            const result = await axios.post("/api/users");
            if (result.data) {
                setUserDetail(result.data);
            }
        } catch (error: any) {
            // Only log unexpected errors; avoid throwing unhandled rejection on auth transitions
            if (error?.response?.status !== 401) {
                console.error("Failed to load user details:", error);
            }
        }
    }, [isLoaded, isSignedIn, user]);

    useEffect(() => {
        if (isLoaded && isSignedIn && user) {
            loadUserDetail();
        } else if (isLoaded && !isSignedIn) {
            setUserDetail(null);
        }
    }, [isLoaded, isSignedIn, user, loadUserDetail]);

    return (
        <div>
            <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
                {children}
            </UserDetailContext.Provider>
        </div>
    );
}

export default Provider;