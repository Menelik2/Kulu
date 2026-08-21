import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import {
  adminGetDeliveryConfigs,
  adminUpdateDeliveryConfig,
  adminEnsureDefaultDeliveryConfigs,
} from '@/services/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FeeRow {
  id: string
  region: string
  fee: string
  estimated_days_min: string
  estimated_days_max: string
  is_active: boolean
}

export default function AdminSettings() {
  const qc = useQueryClient()
  const [rows, setRows] = useState<FeeRow[] | null>(null)

  const { isLoading } = useQuery({
    queryKey: ['admin', 'delivery_configs'],
    queryFn: async () => {
      let list = await adminGetDeliveryConfigs()
      if (!list.length) {
        list = await adminEnsureDefaultDeliveryConfigs()
      }
      setRows(
        list.map((c) => ({
          id: c.id,
          region: c.region,
          fee: String(c.fee),
          estimated_days_min: String(c.estimated_days_min),
          estimated_days_max: String(c.estimated_days_max),
          is_active: c.is_active,
        }))
      )
      return list
    },
  })

  const save = useMutation({
    mutationFn: async () => {
      if (!rows) return
      for (const r of rows) {
        const fee = Number(r.fee)
        const min = Number(r.estimated_days_min)
        const max = Number(r.estimated_days_max)
        if (Number.isNaN(fee) || fee < 0) throw new Error(`Invalid fee for ${r.region}`)
        if (Number.isNaN(min) || Number.isNaN(max) || min < 0 || max < min) {
          throw new Error(`Invalid delivery days for ${r.region}`)
        }
        await adminUpdateDeliveryConfig(r.id, {
          fee,
          estimated_days_min: min,
          estimated_days_max: max,
          is_active: r.is_active,
        })
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin', 'delivery_configs'] })
      qc.invalidateQueries({ queryKey: ['delivery_configs'] })
      toast.success('Delivery fees saved')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateRow = (id: string, patch: Partial<FeeRow>) => {
    setRows((prev) => prev?.map((r) => (r.id === id ? { ...r, ...patch } : r)) ?? null)
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-3xl max-w-full overflow-x-hidden pb-8">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">Settings</h1>
          <p className="text-xs sm:text-sm text-charcoal-500 mt-1">
            Delivery fees are used at checkout.
          </p>
        </div>
        <Button
          size="sm"
          className="rounded-full shrink-0 h-9"
          loading={save.isPending}
          disabled={!rows?.length}
          onClick={() => save.mutate()}
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </Button>
      </div>

      <Card className="min-w-0">
        <CardHeader className="p-3 sm:p-6 pb-2">
          <CardTitle className="text-sm sm:text-base">Store</CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 space-y-2.5 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-charcoal-500 shrink-0">Name</span>
            <span className="font-medium text-charcoal-900 text-right">KULU</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-charcoal-500 shrink-0">Payment</span>
            <span className="font-medium text-charcoal-900 text-right text-xs sm:text-sm">
              Cash on Delivery
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-charcoal-500 shrink-0">Currency</span>
            <span className="font-medium text-charcoal-900 text-right">ETB</span>
          </div>
          <div className="flex justify-between gap-3 items-center">
            <span className="text-charcoal-500 shrink-0">Live site</span>
            <a
              href="https://kulu.sites.bd"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary-600 hover:underline text-right break-all text-xs sm:text-sm"
            >
              kulu.sites.bd
            </a>
          </div>
        </CardContent>
      </Card>

      <Card className="min-w-0">
        <CardHeader className="p-3 sm:p-6 flex flex-row items-center justify-between gap-2 space-y-0">
          <CardTitle className="text-sm sm:text-base">Delivery fees by region</CardTitle>
          <Button
            size="sm"
            className="rounded-full hidden sm:inline-flex"
            loading={save.isPending}
            disabled={!rows?.length}
            onClick={() => save.mutate()}
          >
            <Save className="h-4 w-4" /> Save
          </Button>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {isLoading || !rows ? (
            <div className="flex items-center gap-2 text-charcoal-500 py-8 justify-center">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading…
            </div>
          ) : (
            <>
              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-3">
                {rows.map((r) => (
                  <div
                    key={r.id}
                    className="rounded-xl border border-charcoal-100 bg-charcoal-50/50 p-3 space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-sm text-charcoal-900">{r.region}</p>
                      <label className="flex items-center gap-1.5 text-xs text-charcoal-600">
                        <input
                          type="checkbox"
                          checked={r.is_active}
                          onChange={(e) => updateRow(r.id, { is_active: e.target.checked })}
                          className="rounded border-charcoal-300 text-primary-600 h-4 w-4"
                        />
                        Active
                      </label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-charcoal-500 font-medium">Fee (ETB)</label>
                        <Input
                          type="number"
                          min={0}
                          step={1}
                          value={r.fee}
                          onChange={(e) => updateRow(r.id, { fee: e.target.value })}
                          className="h-10 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-charcoal-500 font-medium">Min days</label>
                        <Input
                          type="number"
                          min={0}
                          value={r.estimated_days_min}
                          onChange={(e) =>
                            updateRow(r.id, { estimated_days_min: e.target.value })
                          }
                          className="h-10 rounded-lg text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-charcoal-500 font-medium">Max days</label>
                        <Input
                          type="number"
                          min={0}
                          value={r.estimated_days_max}
                          onChange={(e) =>
                            updateRow(r.id, { estimated_days_max: e.target.value })
                          }
                          className="h-10 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto -mx-1">
                <table className="w-full text-sm min-w-[480px]">
                  <thead>
                    <tr className="text-left text-charcoal-500 border-b border-charcoal-100">
                      <th className="pb-2 font-medium pr-2">Region</th>
                      <th className="pb-2 font-medium pr-2 w-28">Fee (ETB)</th>
                      <th className="pb-2 font-medium pr-2 w-20">Min days</th>
                      <th className="pb-2 font-medium pr-2 w-20">Max days</th>
                      <th className="pb-2 font-medium w-16">Active</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.id} className="border-b border-charcoal-50">
                        <td className="py-2.5 pr-2 font-medium text-charcoal-800">{r.region}</td>
                        <td className="py-2.5 pr-2">
                          <Input
                            type="number"
                            min={0}
                            step={1}
                            value={r.fee}
                            onChange={(e) => updateRow(r.id, { fee: e.target.value })}
                            className="h-9 rounded-lg"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <Input
                            type="number"
                            min={0}
                            value={r.estimated_days_min}
                            onChange={(e) =>
                              updateRow(r.id, { estimated_days_min: e.target.value })
                            }
                            className="h-9 rounded-lg"
                          />
                        </td>
                        <td className="py-2.5 pr-2">
                          <Input
                            type="number"
                            min={0}
                            value={r.estimated_days_max}
                            onChange={(e) =>
                              updateRow(r.id, { estimated_days_max: e.target.value })
                            }
                            className="h-9 rounded-lg"
                          />
                        </td>
                        <td className="py-2.5">
                          <input
                            type="checkbox"
                            checked={r.is_active}
                            onChange={(e) => updateRow(r.id, { is_active: e.target.checked })}
                            className="rounded border-charcoal-300 text-primary-600 h-4 w-4"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <p className="text-xs text-charcoal-400 mt-4">
            Changes apply to new checkouts after Save.
          </p>
          <Button
            size="sm"
            className="rounded-full w-full mt-3 sm:hidden h-11"
            loading={save.isPending}
            disabled={!rows?.length}
            onClick={() => save.mutate()}
          >
            <Save className="h-4 w-4" /> Save delivery fees
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
