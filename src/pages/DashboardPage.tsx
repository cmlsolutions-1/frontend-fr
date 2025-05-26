import { Sidebar } from '@/components/ui/sidebar/Sidebar';

export default function DashboardPage() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="p-10">
        <h2 className="text-2xl">Bienvenido al Dashboard</h2>
      </div>
    </div>
  );
}
