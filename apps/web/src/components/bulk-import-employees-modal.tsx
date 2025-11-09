"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Upload,
  Download,
  FileSpreadsheet,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  parseCSV,
  parseExcel,
  downloadSampleCSV,
  downloadSampleExcel,
  type ParsedImportData,
  type EmployeeImportRow,
} from "@/lib/bulk-import-utils";
import { ScrollArea } from "@/components/ui/scrollarea";

interface BulkImportEmployeesModalProps {
  onImportComplete?: () => void;
}

type ImportStep = "upload" | "preview" | "importing" | "complete";

export function BulkImportEmployeesModal({
  onImportComplete,
}: BulkImportEmployeesModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<ImportStep>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedImportData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResults, setImportResults] = useState<{
    successful: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  } | null>(null);

  const handleReset = () => {
    setStep("upload");
    setSelectedFile(null);
    setParsedData(null);
    setImportResults(null);
  };

  const handleClose = () => {
    setOpen(false);
    setTimeout(handleReset, 300);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsProcessing(true);

    try {
      let parsed: ParsedImportData;

      if (file.name.endsWith(".csv")) {
        parsed = await parseCSV(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        parsed = await parseExcel(file);
      } else {
        toast.error(
          "Unsupported file format. Please upload CSV or Excel file."
        );
        setSelectedFile(null);
        return;
      }

      setParsedData(parsed);
      console.log("Parsed data:", parsed);

      if (parsed.errors.length > 0) {
        toast.warning(
          `Found ${parsed.errors.length} validation error(s). Please review.`
        );
        setStep("preview"); // Show preview even with errors so user can see them
      } else if (parsed.data.length > 0) {
        toast.success(`Successfully parsed ${parsed.data.length} employee(s)`);
        setStep("preview");
      } else {
        toast.error("No valid data found in file");
        setStep("preview"); // Show preview to display warnings
      }
    } catch (error) {
      toast.error("Failed to parse file");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData || parsedData.data.length === 0) return;

    setStep("importing");
    setIsProcessing(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/employees/bulk-import`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ employees: parsedData.data }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        setImportResults(result);
        setStep("complete");

        if (result.successful > 0) {
          toast.success(
            `Successfully imported ${result.successful} employee(s)`,
            { duration: 5000 }
          );
          onImportComplete?.();
        }

        if (result.failed > 0) {
          toast.error(`Failed to import ${result.failed} employee(s)`);
        }
      } else {
        toast.error(result.error || "Failed to import employees");
        setStep("preview");
      }
    } catch (error) {
      toast.error("An error occurred during import");
      console.error(error);
      setStep("preview");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) handleClose();
        else setOpen(true);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Employees</DialogTitle>
          <DialogDescription>
            Import multiple employees from CSV or Excel file
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {step === "upload" && (
            <div className="space-y-6 py-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Instructions</AlertTitle>
                <AlertDescription className="space-y-2 text-sm">
                  <p className="font-semibold mt-2">Required Fields:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <strong>Full Name</strong> - Will be automatically split
                      into first, middle, and last name
                    </li>
                    <li>
                      <strong>Email</strong> - Must be unique and valid format
                    </li>
                    <li>
                      <strong>Date of Joining</strong> - Format: YYYY-MM-DD
                      (e.g., 2024-01-15)
                    </li>
                    <li>
                      <strong>Basic Salary</strong> - Must be a positive number
                    </li>
                  </ul>

                  <p className="font-semibold mt-3">Optional Fields:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      First Name, Last Name, Middle Name (if you prefer not to
                      use Full Name)
                    </li>
                    <li>Phone, Date of Birth (YYYY-MM-DD)</li>
                    <li>Gender (MALE, FEMALE, OTHER, PREFER_NOT_TO_SAY)</li>
                    <li>Address, City, State, Country, Postal Code</li>
                    <li>Department, Designation</li>
                    <li>
                      Role (ADMIN, EMPLOYEE, HR_OFFICER, PAYROLL_OFFICER) -
                      defaults to EMPLOYEE
                    </li>
                    <li>PF Contribution, Professional Tax</li>
                  </ul>

                  <p className="font-semibold mt-3">Important Notes:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      Use <strong>Full Name</strong> column for easy entry
                      (e.g., "John Doe" or "Jane Marie Smith")
                    </li>
                    <li>
                      Login credentials will be auto-generated and emailed to
                      each employee
                    </li>
                    <li>All dates must be in YYYY-MM-DD format</li>
                    <li>Email addresses must be valid and unique</li>
                    <li>
                      Duplicate emails in the file will cause import to fail
                    </li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleCSV}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Download CSV Template
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadSampleExcel}
                  >
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Download Excel Template
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Upload File</Label>
                  <Input
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    disabled={isProcessing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Supported formats: CSV, Excel (.xlsx, .xls)
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === "preview" && parsedData && (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Import Preview</h3>
                  <p className="text-sm text-muted-foreground">
                    {parsedData.data.length} valid employee(s) ready to import
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleReset}>
                  Choose Different File
                </Button>
              </div>

              {parsedData.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    Validation Errors ({parsedData.errors.length})
                  </AlertTitle>
                  <AlertDescription>
                    <ScrollArea className="h-32 w-full mt-2">
                      <ul className="space-y-1 text-xs">
                        {parsedData.errors.slice(0, 20).map((error, idx) => (
                          <li key={idx}>
                            Row {error.row}: <strong>{error.field}</strong> -{" "}
                            {error.message}
                          </li>
                        ))}
                        {parsedData.errors.length > 20 && (
                          <li className="font-semibold">
                            ... and {parsedData.errors.length - 20} more errors
                          </li>
                        )}
                      </ul>
                    </ScrollArea>
                  </AlertDescription>
                </Alert>
              )}

              {parsedData.warnings.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Warnings</AlertTitle>
                  <AlertDescription>
                    <ul className="space-y-1 text-xs mt-2">
                      {parsedData.warnings.map((warning, idx) => (
                        <li key={idx}>{warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {parsedData.data.length === 0 && parsedData.errors.length > 0 && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>No Valid Records</AlertTitle>
                  <AlertDescription>
                    All rows have validation errors. Please fix the errors above
                    and try again.
                  </AlertDescription>
                </Alert>
              )}

              {parsedData.data.length > 0 && (
                <div className="border rounded-lg">
                  <ScrollArea className="h-64">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0">
                        <tr>
                          <th className="p-2 text-left">#</th>
                          <th className="p-2 text-left">Name</th>
                          <th className="p-2 text-left">Email</th>
                          <th className="p-2 text-left">Department</th>
                          <th className="p-2 text-left">Role</th>
                          <th className="p-2 text-left">Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {parsedData.data.map((emp, idx) => (
                          <tr key={idx} className="border-t">
                            <td className="p-2">{idx + 1}</td>
                            <td className="p-2">
                              {emp.firstName}{" "}
                              {emp.middleName ? `${emp.middleName} ` : ""}
                              {emp.lastName}
                            </td>
                            <td className="p-2">{emp.email}</td>
                            <td className="p-2">{emp.department || "-"}</td>
                            <td className="p-2">{emp.role || "EMPLOYEE"}</td>
                            <td className="p-2">
                              {emp.basicSalary.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}

          {step === "importing" && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">
                Importing employees... This may take a moment.
              </p>
            </div>
          )}

          {step === "complete" && importResults && (
            <div className="space-y-4 py-4">
              <Alert variant={importResults.failed > 0 ? "default" : "default"}>
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Import Complete</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2 mt-2">
                    <p>
                      Successfully imported:{" "}
                      <strong>{importResults.successful}</strong> employee(s)
                    </p>
                    {importResults.failed > 0 && (
                      <p className="text-destructive">
                        Failed: <strong>{importResults.failed}</strong>{" "}
                        employee(s)
                      </p>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {importResults.errors.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold text-sm mb-2">Import Errors</h4>
                  <ScrollArea className="h-48">
                    <ul className="space-y-2 text-xs">
                      {importResults.errors.map((error, idx) => (
                        <li key={idx} className="text-destructive">
                          <strong>{error.email}</strong>: {error.error}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          {step === "upload" && (
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          )}

          {step === "preview" && (
            <>
              <Button type="button" variant="outline" onClick={handleReset}>
                Back
              </Button>
              <Button
                type="button"
                onClick={handleImport}
                disabled={
                  !parsedData || parsedData.data.length === 0 || isProcessing
                }
              >
                Import {parsedData?.data.length || 0} Employee(s)
              </Button>
            </>
          )}

          {step === "complete" && (
            <>
              <Button type="button" variant="outline" onClick={handleReset}>
                Import More
              </Button>
              <Button type="button" onClick={handleClose}>
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
