import KpiCard from '@/app/components/KpiCard';
import OccupancyChart from '@/app/components/OccupancyChart';

export default function DashboardPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
        <KpiCard title="Disponibles" value={4} color="#16a34a" />
        <KpiCard title="Ocupadas" value={0} color="#dc2626" />
        <KpiCard title="Mantenimiento" value={0} color="#f59e0b" />
        <KpiCard title="Reservas hoy" value={0} color="#0f766e" />
      </div>

      <div style={{ marginTop: 20 }}>
        <h3>Ocupación</h3>
        <OccupancyChart />
      </div>
    </div>
  );
}
