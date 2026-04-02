import { Button } from "@/components/ui/button";
import { Download, FileText, Sheet, Code } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface ExportButtonsProps {
  businessId: number;
  businessName: string;
}

export default function ExportButtons({ businessId, businessName }: ExportButtonsProps) {
  const [isExporting, setIsExporting] = useState<"html" | "csv" | "report" | null>(null);

  const exportHTMLQuery = trpc.export.exportHTML.useQuery(
    { businessId },
    { enabled: false }
  );

  const exportCSVQuery = trpc.export.exportCSV.useQuery(
    { businessId },
    { enabled: false }
  );

  const exportReportQuery = trpc.export.exportReport.useQuery(
    { businessId },
    { enabled: false }
  );

  const handleExport = async (type: "html" | "csv" | "report") => {
    try {
      setIsExporting(type);

      let data: string;
      let filename: string;
      let mimeType: string;

      if (type === "html") {
        const result = await exportHTMLQuery.refetch();
        if (!result.data) throw new Error("Failed to export HTML");
        data = result.data.html;
        filename = result.data.filename;
        mimeType = result.data.mimeType;
      } else if (type === "csv") {
        const result = await exportCSVQuery.refetch();
        if (!result.data) throw new Error("Failed to export CSV");
        data = result.data.csv;
        filename = result.data.filename;
        mimeType = result.data.mimeType;
      } else {
        const result = await exportReportQuery.refetch();
        if (!result.data) throw new Error("Failed to export report");
        data = result.data.report;
        filename = result.data.filename;
        mimeType = result.data.mimeType;
      }

      // Create blob and download
      const blob = new Blob([data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`${type.toUpperCase()} exported successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error(`Failed to export ${type.toUpperCase()}`);
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      <Button
        onClick={() => handleExport("html")}
        disabled={isExporting !== null}
        variant="outline"
        size="sm"
        className="text-xs sm:text-sm"
      >
        <Code className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Export HTML</span>
        <span className="sm:hidden">HTML</span>
      </Button>

      <Button
        onClick={() => handleExport("csv")}
        disabled={isExporting !== null}
        variant="outline"
        size="sm"
        className="text-xs sm:text-sm"
      >
        <Sheet className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Export CSV</span>
        <span className="sm:hidden">CSV</span>
      </Button>

      <Button
        onClick={() => handleExport("report")}
        disabled={isExporting !== null}
        variant="outline"
        size="sm"
        className="text-xs sm:text-sm"
      >
        <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
        <span className="hidden sm:inline">Export Report</span>
        <span className="sm:hidden">Report</span>
      </Button>

      {isExporting && (
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-primary mr-2" />
          Exporting...
        </div>
      )}
    </div>
  );
}
