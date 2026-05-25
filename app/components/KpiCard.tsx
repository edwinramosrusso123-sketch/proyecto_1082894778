export default function KpiCard({ title, value, color }: { title: string; value: string | number; color?: string }) {
  return (
    <div style={{ padding: 12, borderRadius: 8, background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
      <div style={{ fontSize: 12, color: '#666' }}>{title}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || '#111' }}>{value}</div>
    </div>
  );
}
