import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search } from "lucide-react";

/**
 * DataTable — reusable premium data table with search, empty state, actions.
 * columns: [{ key, header, render?, className?, testid? }]
 * rowActions: (row) => ReactNode
 */
export default function DataTable({
  title,
  description,
  data = [],
  columns = [],
  onAdd,
  addLabel = "Add",
  addTestId = "add-btn",
  searchable = true,
  searchKeys = [],
  rowActions,
  toolbar,
  loading,
  emptyLabel = "No records yet",
}) {
  const [q, setQ] = useState("");

  // Safely ensure 'safeData' is always an array to prevent crashes
  const safeData = Array.isArray(data) ? data : [];

  const filtered = q
    ? safeData.filter((row) =>
        (searchKeys.length ? searchKeys : Object.keys(row || {})).some((k) =>
          String(row?.[k] ?? "").toLowerCase().includes(q.toLowerCase())
        )
      )
    : safeData;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-outfit text-3xl font-semibold tracking-tight">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          {searchable && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/70 text-sm text-muted-foreground">
              <Search className="w-4 h-4" />
              <input
                data-testid={`${addTestId}-search`}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search…"
                className="bg-transparent border-0 outline-none text-sm w-40"
              />
            </div>
          )}
          {onAdd && (
            <Button data-testid={addTestId} onClick={onAdd} className="rounded-full btn-gradient">
              <Plus className="w-4 h-4 mr-1" /> {addLabel}
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-card border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {columns.map((c) => (
                <TableHead key={c.key} className={c.className}>{c.header}</TableHead>
              ))}
              {rowActions && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="text-center text-sm text-muted-foreground py-10">
                  Loading…
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length + (rowActions ? 1 : 0)} className="text-center text-sm text-muted-foreground py-10">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
            {!loading && filtered.map((row, i) => (
              <TableRow key={row?.id || i} data-testid={`row-${i}`}>
                {columns.map((c) => (
                  <TableCell key={c.key} className={c.className}>
                    {c.render ? c.render(row) : row?.[c.key]}
                  </TableCell>
                ))}
                {rowActions && (
                  <TableCell className="text-right">{rowActions(row)}</TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function StatusBadge({ value }) {
  const map = {
    active: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
    graduated: "bg-accent text-accent-foreground",
    inactive: "bg-muted text-muted-foreground",
    paid: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
    sent: "bg-accent text-accent-foreground",
    overdue: "bg-destructive/15 text-destructive",
    draft: "bg-muted text-muted-foreground",
    new: "bg-accent text-accent-foreground",
    qualified: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    proposal: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
    negotiation: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
    won: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
    lost: "bg-destructive/15 text-destructive",
    planning: "bg-muted text-muted-foreground",
    in_progress: "bg-accent text-accent-foreground",
    completed: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
    present: "bg-[hsl(var(--success)/0.15)] text-[hsl(var(--success))]",
    absent: "bg-destructive/15 text-destructive",
    late: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400",
  };
  const cls = map[value] || "bg-muted text-muted-foreground";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium capitalize ${cls}`}>
      {(value || "-").replace("_", " ")}
    </span>
  );
}