import { AdminSidebar } from '@/widgets/admin-sidebar';
import { AdminHeader } from '@/widgets/admin-header';
import { AuthGate } from '@/widgets/auth-gate';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGate requiredRole="ADMIN">
      <div className="flex min-h-screen bg-[#F3F4F6] text-[#1E1E1E]">
        <AdminSidebar />
        <main className="flex w-full flex-col lg:pl-[70px]">
          <AdminHeader />
          <div className="flex-1 p-6 md:p-8">
            <div className="mx-auto w-full max-w-[1400px]">{children}</div>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
