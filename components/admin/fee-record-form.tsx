"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { currentBangladeshYear } from "@/lib/utils";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

export function FeeRecordForm({
  action,
  students,
  feeTypes
}: {
  action: (formData: FormData) => void | Promise<void>;
  students: any[];
  feeTypes: any[];
}) {
  const [selectedFeeTypeId, setSelectedFeeTypeId] = useState("");
  const [amount, setAmount] = useState("0");
  const feeTypeById = useMemo(
    () => new Map(feeTypes.map((fee) => [fee.id, fee])),
    [feeTypes]
  );

  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="student_id">Student</Label>
        <Select id="student_id" name="student_id" required>
          <option value="">Select student</option>
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} - Roll {student.roll} - {student.classes?.name ?? "No class"}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fee_type_id">Fee type</Label>
        <Select
          id="fee_type_id"
          name="fee_type_id"
          required
          value={selectedFeeTypeId}
          onChange={(event) => {
            const nextId = event.target.value;
            const nextFeeType = feeTypeById.get(nextId);
            setSelectedFeeTypeId(nextId);
            setAmount(String(nextFeeType?.default_amount ?? 0));
          }}
        >
          <option value="">Select fee</option>
          {feeTypes.map((fee) => (
            <option key={fee.id} value={fee.id}>
              {fee.name}
            </option>
          ))}
        </Select>
        <p className="text-xs text-muted-foreground">
          Selecting a fee type fills the amount from that fee type&apos;s default amount.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          required
          type="number"
          min="0"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="discount_amount">Discount / Vortuki</Label>
        <Input id="discount_amount" name="discount_amount" type="number" min="0" defaultValue="0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="paid_amount">Already paid</Label>
        <Input id="paid_amount" name="paid_amount" type="number" min="0" defaultValue="0" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="month">Month</Label>
        <Select id="month" name="month" defaultValue="">
          <option value="">No month / one-time</option>
          {months.map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="session_year">Session year</Label>
        <Input id="session_year" name="session_year" required defaultValue={currentBangladeshYear()} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="due_date">Due date</Label>
        <Input id="due_date" name="due_date" type="date" />
      </div>
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="note">Note</Label>
        <Textarea id="note" name="note" />
      </div>
      <div className="md:col-span-2">
        <Button type="submit">Create fee record</Button>
      </div>
    </form>
  );
}
