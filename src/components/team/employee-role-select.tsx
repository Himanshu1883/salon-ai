"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE,
  EMPLOYEE_ROLE_LABELS,
  isPresetEmployeeRole,
  PRESET_EMPLOYEE_ROLES,
  type PresetEmployeeRole,
} from "@/lib/team";

type EmployeeRoleSelectProps = {
  value: string;
  onChange: (role: string) => void;
  disabled?: boolean;
  includeOwner?: boolean;
  customInputId?: string;
};

const DEFAULT_PRESETS: PresetEmployeeRole[] = PRESET_EMPLOYEE_ROLES.filter(
  (role) => role !== "owner"
);

export function EmployeeRoleSelect({
  value,
  onChange,
  disabled,
  includeOwner = true,
  customInputId = "customRole",
}: EmployeeRoleSelectProps) {
  const presetRoles = includeOwner
    ? PRESET_EMPLOYEE_ROLES
    : DEFAULT_PRESETS;

  const [selectValue, setSelectValue] = useState(() =>
    isPresetEmployeeRole(value) ? value : CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE
  );
  const [customRole, setCustomRole] = useState(() =>
    isPresetEmployeeRole(value) ? "" : value
  );

  useEffect(() => {
    if (isPresetEmployeeRole(value)) {
      setSelectValue(value);
      setCustomRole("");
      return;
    }
    setSelectValue(CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE);
    setCustomRole(value);
  }, [value]);

  function handlePresetChange(next: string) {
    setSelectValue(next);
    if (next === CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE) {
      onChange(customRole.trim());
      return;
    }
    onChange(next);
  }

  function handleCustomRoleChange(next: string) {
    setCustomRole(next);
    if (selectValue === CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE) {
      onChange(next.trim());
    }
  }

  return (
    <div className="space-y-2">
      <Select
        value={selectValue}
        onValueChange={handlePresetChange}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select role" />
        </SelectTrigger>
        <SelectContent>
          {presetRoles.map((role) => (
            <SelectItem key={role} value={role}>
              {EMPLOYEE_ROLE_LABELS[role]}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE}>
            Custom role...
          </SelectItem>
        </SelectContent>
      </Select>
      {selectValue === CUSTOM_EMPLOYEE_ROLE_SELECT_VALUE && (
        <Input
          id={customInputId}
          placeholder="Enter role name"
          value={customRole}
          onChange={(e) => handleCustomRoleChange(e.target.value)}
          disabled={disabled}
          required
          maxLength={50}
        />
      )}
    </div>
  );
}
