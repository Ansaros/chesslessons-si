'use client';

import { VideosView } from "@/modules/videos/ui/views/videos-view";
import { ProtectedRoute } from "@/context/auth-context";

const Page = () => {
    return (
        <ProtectedRoute>
            <VideosView />
        </ProtectedRoute>
    );
};

export default Page;
