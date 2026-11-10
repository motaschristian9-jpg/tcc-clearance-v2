import React, { useState, useMemo } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';
import {
  GateScanLogEntry,
  TIME_SLOTS,
} from '@/types/attendance';
import {
  Search,
  Download,
  Trash2,
  Clock,
  CheckCircle2,
  Users,
  FileSpreadsheet,
  X,
  BadgeCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface GateScanLogsCardProps {
  logs: GateScanLogEntry[];
  stationCode: string;
  department: string;
  onClearLogs?: () => void;
}

export const GateScanLogsCard: React.FC<GateScanLogsCardProps> = ({
  logs,
  stationCode,
  department,
  onClearLogs,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDay, setFilterDay] = useState<string>('all');
  const [filterSlot, setFilterSlot] = useState<string>('all');

  // Filter logs by search query (name, ID, section) and day/slot
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        log.studentName.toLowerCase().includes(q) ||
        log.schoolId.toLowerCase().includes(q) ||
        log.section.toLowerCase().includes(q) ||
        log.stampedBy.officerName.toLowerCase().includes(q);

      const matchesDay = filterDay === 'all' || log.day === filterDay;
      const matchesSlot = filterSlot === 'all' || log.slot === filterSlot;

      return matchesQuery && matchesDay && matchesSlot;
    });
  }, [logs, searchQuery, filterDay, filterSlot]);

  // Export logs to standard CSV file for department records
  const handleExportCsv = () => {
    if (logs.length === 0) {
      toast.error('No scan records to export.');
      return;
    }

    const headers = [
      'Timestamp',
      'Date',
      'Time',
      'School ID',
      'Full Name',
      'Department',
      'Section',
      'Event Day',
      'Session Slot',
      'Station',
      'Officer Name',
      'Officer Position',
    ];

    const rows = logs.map((log) => [
      `"${new Date(log.timestamp).toISOString()}"`,
      `"${log.dateFormatted}"`,
      `"${log.timeFormatted}"`,
      `"${log.schoolId}"`,
      `"${log.studentName.replace(/"/g, '""')}"`,
      `"${log.department}"`,
      `"${log.section}"`,
      `"${log.day}"`,
      `"${log.slotLabel}"`,
      `"${log.stampedBy.stationCode}"`,
      `"${log.stampedBy.officerName.replace(/"/g, '""')}"`,
      `"${log.stampedBy.position.replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute(
      'download',
      `TCC_Gate_Scan_Logs_${department}_${stationCode}_${dateStr}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Gate scan log exported as CSV');
  };

  const getInitials = (name: string) => {
    if (!name) return 'ST';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <Card className="border border-border shadow-sm flex flex-col h-full">
      <CardHeader className="text-left pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
          <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
            Student Scan Logs
          </CardTitle>

          {/* Action buttons: Total Scanned on the left side of Export CSV */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-muted/30 text-xs">
              <Users className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground text-[11px]">Total Scanned:</span>
              <span className="font-mono font-semibold text-foreground text-[11px]">
                {logs.length}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCsv}
              disabled={logs.length === 0}
              className="h-8 text-xs px-2.5 gap-1.5 cursor-pointer text-muted-foreground hover:text-foreground"
              title="Download attendance records in CSV format"
            >
              <Download className="size-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>

            {onClearLogs && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClearLogs}
                disabled={logs.length === 0}
                className="h-8 text-xs px-2 text-muted-foreground hover:text-destructive cursor-pointer"
                title="Clear current station logs"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              type="text"
              placeholder="Search name, ID, section..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-7 text-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          {/* Filter by Day */}
          <div className="flex items-center gap-2">
            <Select value={filterDay} onValueChange={setFilterDay}>
              <SelectTrigger className="h-8 text-xs w-[105px]">
                <SelectValue placeholder="Day" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Days</SelectItem>
                  <SelectItem value="Day 1">Day 1</SelectItem>
                  <SelectItem value="Day 2">Day 2</SelectItem>
                  <SelectItem value="Day 3">Day 3</SelectItem>
                  <SelectItem value="Day 4">Day 4</SelectItem>
                  <SelectItem value="Day 5">Day 5</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            {/* Filter by Slot */}
            <Select value={filterSlot} onValueChange={setFilterSlot}>
              <SelectTrigger className="h-8 text-xs w-[125px]">
                <SelectValue placeholder="Slot" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All Slots</SelectItem>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot.id} value={slot.id}>
                      {slot.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-4 pt-0">
        {filteredLogs.length > 0 ? (
          <div className="flex flex-col gap-2 max-h-[480px] overflow-y-auto no-scrollbar pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border border-border/80 bg-card hover:bg-muted/30 transition-colors flex items-center justify-between gap-3 text-left"
              >
                {/* Left: Avatar & Student Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="size-9 ring-1 ring-border shrink-0">
                    {log.photoDataUrl && (
                      <AvatarImage
                        src={log.photoDataUrl}
                        alt={log.studentName}
                        className="object-cover scale-x-[-1]"
                      />
                    )}
                    <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-semibold">
                      {getInitials(log.studentName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-foreground truncate">
                        {log.studentName}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium">
                        <CheckCircle2 className="size-2.5" />
                        Cleared
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="font-mono text-muted-foreground">
                        {log.schoolId}
                      </span>
                      <span>•</span>
                      <span>
                        {log.department} - {log.section}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground/80 mt-0.5 truncate">
                      <BadgeCheck className="size-2.5 text-primary shrink-0" />
                      <span className="truncate">
                        By {log.stampedBy.stationCode}: {log.stampedBy.officerName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Slot Badge & Timestamp */}
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted border border-border text-foreground">
                    {log.day} · {log.slotLabel}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1 font-mono">
                    <Clock className="size-2.5" />
                    <span>{log.timeFormatted}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          /* Empty State when no scans recorded yet */
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-border rounded-xl bg-muted/10 my-auto">
            <div className="size-11 rounded-full bg-muted/50 border border-border flex items-center justify-center text-muted-foreground mb-2">
              <FileSpreadsheet className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              No Scanned Students Yet
            </h3>
          </div>
        ) : (
          /* Filter returned no results */
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center border border-dashed border-border rounded-xl bg-muted/10">
            <Search className="size-5 text-muted-foreground mb-2" />
            <p className="text-xs font-medium text-foreground">
              No matching records found
            </p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Try adjusting your search query or filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterDay('all');
                setFilterSlot('all');
              }}
              className="mt-3 h-7 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
