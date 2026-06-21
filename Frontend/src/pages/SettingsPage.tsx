import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  CardHeader,
  FullSpinner,
  Input,
  Select,
  Toggle,
} from "@/components/ui";
import { useSettings, useSettingsMutation } from "@/hooks/queries";
import { cn, humanize } from "@/lib/utils";

const tabs = ["General", "Operations", "Notifications", "Staff"] as const;
type Tab = (typeof tabs)[number];

export function SettingsPage() {
  const [tab, setTab] = useState<Tab>("General");
  const { data: settings, isLoading } = useSettings();
  const { update } = useSettingsMutation();
  const [form, setForm] = useState<Record<string, unknown>>({});

  if (isLoading) return <FullSpinner label="Loading settings" />;

  const value = (key: string) => (form[key] ?? settings?.[key] ?? "") as string;
  const setValue = (key: string, v: unknown) =>
    setForm((f) => ({ ...f, [key]: v }));
  const save = () => update.mutate(form);

  return (
    <div className="space-y-5">
      <div className="flex gap-1 border-b border-brand-border">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition",
              tab === t
                ? "border-b-2 border-gold text-gold-dark"
                : "text-gray-500 hover:text-brand-ink",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "General" ? (
        <Card>
          <CardHeader title="General Settings" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Hotel Name"
              value={value("hotel_name")}
              onChange={(e) => setValue("hotel_name", e.target.value)}
            />
            <Input
              label="Phone"
              value={value("phone")}
              onChange={(e) => setValue("phone", e.target.value)}
            />
            <Input
              label="Email"
              value={value("email")}
              onChange={(e) => setValue("email", e.target.value)}
            />
            <Input
              label="Website"
              value={value("website")}
              onChange={(e) => setValue("website", e.target.value)}
            />
            <div className="col-span-2">
              <Input
                label="Address"
                value={value("address")}
                onChange={(e) => setValue("address", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={save} loading={update.isPending}>
              Save Changes
            </Button>
          </div>
        </Card>
      ) : null}

      {tab === "Operations" ? (
        <Card>
          <CardHeader title="Operations" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="time"
              label="Check-in Time"
              value={value("checkin_time")}
              onChange={(e) => setValue("checkin_time", e.target.value)}
            />
            <Input
              type="time"
              label="Check-out Time"
              value={value("checkout_time")}
              onChange={(e) => setValue("checkout_time", e.target.value)}
            />
            <Select
              label="Currency"
              value={value("currency")}
              onChange={(e) => setValue("currency", e.target.value)}
              options={["USD", "EUR", "GBP", "AED"].map((c) => ({
                value: c,
                label: c,
              }))}
            />
            <Input
              label="Timezone"
              value={value("timezone")}
              onChange={(e) => setValue("timezone", e.target.value)}
            />
            <Input
              type="number"
              label="Tax Rate (%)"
              value={value("tax_rate")}
              onChange={(e) => setValue("tax_rate", e.target.value)}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={save} loading={update.isPending}>
              Save Changes
            </Button>
          </div>
        </Card>
      ) : null}

      {tab === "Notifications" ? (
        <Card>
          <CardHeader title="Email (SMTP) Settings" />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              value={value("smtp_host")}
              onChange={(e) => setValue("smtp_host", e.target.value)}
            />
            <Input
              type="number"
              label="Port"
              value={value("smtp_port")}
              onChange={(e) => setValue("smtp_port", e.target.value)}
            />
            <Input
              label="Username"
              value={value("smtp_user")}
              onChange={(e) => setValue("smtp_user", e.target.value)}
            />
            <Input
              type="password"
              label="Password"
              value={value("smtp_password")}
              onChange={(e) => setValue("smtp_password", e.target.value)}
            />
            <div className="col-span-2">
              <Input
                label="From Email"
                value={value("from_email")}
                onChange={(e) => setValue("from_email", e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-brand-border px-3 py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Enable email notifications
            </span>
            <Toggle
              checked={!!value("email_enabled")}
              onChange={(v) => setValue("email_enabled", v)}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={save} loading={update.isPending}>
              Save Changes
            </Button>
          </div>
        </Card>
      ) : null}

      {tab === "Staff" ? (
        <Card padded={false}>
          <div className="flex items-center justify-between p-4">
            <h3 className="font-semibold text-brand-ink dark:text-gray-100">
              Staff Members
            </h3>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Staff</Button>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-y border-brand-border text-left text-xs uppercase text-brand-muted">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">Role</th>
                <th className="px-4 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {(settings?.staff ?? []).map(
                (s: {
                  id: number;
                  name: string;
                  role: string;
                  status: string;
                }) => (
                  <tr key={s.id} className="border-b border-brand-border/60">
                    <td className="px-4 py-2.5 font-medium">{s.name}</td>
                    <td className="px-4 py-2.5">{humanize(s.role)}</td>
                    <td className="px-4 py-2.5">
                      <Badge
                        color={
                          s.status === "active"
                            ? { bg: "#DCFCE7", text: "#15803D" }
                            : { bg: "#FEE2E2", text: "#B91C1C" }
                        }
                      >
                        {humanize(s.status)}
                      </Badge>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </Card>
      ) : null}
    </div>
  );
}
