import { HelpSidebar } from '@/app/components/help/HelpSidebar';

export default function HelpLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Container to center content roughly */}
            <div className="max-w-[1400px] mx-auto flex">
                <HelpSidebar />
                <main className="flex-1 min-w-0 p-6 md:p-12">
                    {children}
                </main>
            </div>
        </div>
    );
}
