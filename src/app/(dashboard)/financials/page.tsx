import FinancialsTable from '@/components/dashboard/financials-table';

export default function FinancialsPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Financials</h1>
        <p className="text-muted-foreground">
          View and manage patient financial records.
        </p>
      </header>
      <FinancialsTable />
    </div>
  );
}
