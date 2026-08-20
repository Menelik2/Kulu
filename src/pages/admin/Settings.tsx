import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const DELIVERY_FEES: { region: string; fee: number }[] = [
  { region: 'Addis Ababa', fee: 80 },
  { region: 'Oromia', fee: 150 },
  { region: 'Amhara', fee: 180 },
  { region: 'Tigray', fee: 220 },
  { region: 'SNNPR', fee: 180 },
  { region: 'Sidama', fee: 160 },
  { region: 'Dire Dawa', fee: 200 },
  { region: 'Harari', fee: 200 },
  { region: 'Somali', fee: 250 },
  { region: 'Afar', fee: 250 },
  { region: 'Benishangul-Gumuz', fee: 220 },
  { region: 'Gambela', fee: 250 },
]

export default function AdminSettings() {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-charcoal-900">Settings</h1>
        <p className="text-sm text-charcoal-500 mt-1">
          Store configuration overview. Delivery fees are currently defined in checkout code.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Store</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-charcoal-500">Name</span>
            <span className="font-medium text-charcoal-900">KULU</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-charcoal-500">Payment methods</span>
            <span className="font-medium text-charcoal-900">Cash on Delivery (COD)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-charcoal-500">Currency</span>
            <span className="font-medium text-charcoal-900">ETB (Ethiopian Birr)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-charcoal-500">Live site</span>
            <a
              href="https://kuluapps.vercel.app"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary-600 hover:underline"
            >
              kuluapps.vercel.app
            </a>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery fees by region (ETB)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-charcoal-100">
            {DELIVERY_FEES.map((row) => (
              <li key={row.region} className="flex justify-between py-2.5 text-sm">
                <span className="text-charcoal-700">{row.region}</span>
                <span className="font-medium tabular-nums">{row.fee.toLocaleString()} ETB</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-charcoal-400 mt-4">
            To change fees, update <code className="text-charcoal-600">estimateFee</code> in{' '}
            <code className="text-charcoal-600">CheckoutPage.tsx</code> (and keep this list in sync).
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
