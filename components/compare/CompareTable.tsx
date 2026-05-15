'use client'
import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ApartmentWithViewing } from '@/types'

type SortKey = 'viewing_date' | 'monthly_rent' | 'sqft' | 'rating'
type SortDir = 'asc' | 'desc'

export default function CompareTable({ apartments }: { apartments: ApartmentWithViewing[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('rating')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...apartments].sort((a, b) => {
    const av = a[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
    const bv = b[sortKey] ?? (sortDir === 'asc' ? Infinity : -Infinity)
    const cmp = av < bv ? -1 : av > bv ? 1 : 0
    return sortDir === 'asc' ? cmp : -cmp
  })

  const maxRating = Math.max(...apartments.map(a => a.rating ?? 0))

  function SortHead({ label, k }: { label: string; k: SortKey }) {
    const active = sortKey === k
    return (
      <TableHead
        onClick={() => handleSort(k)}
        className={`cursor-pointer select-none text-right whitespace-nowrap ${
          active ? 'text-indigo-600' : 'hover:text-gray-600'
        }`}
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}
      </TableHead>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead>Unit</TableHead>
            <TableHead>Viewing</TableHead>
            <SortHead label="Rent" k="monthly_rent" />
            <TableHead className="text-center">Rooms</TableHead>
            <SortHead label="Sqft" k="sqft" />
            <TableHead>Commute</TableHead>
            <SortHead label="Rating" k="rating" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((apt, i) => {
            const isTop = apt.rating === maxRating && maxRating > 0
            return (
              <TableRow
                key={apt.id}
                className={isTop ? 'bg-amber-50' : i % 2 === 0 ? '' : 'bg-gray-50/50'}
              >
                <TableCell className="font-semibold">
                  <Link
                    href={`/viewings/${apt.viewing_id}/apartments/${apt.id}`}
                    className="hover:text-indigo-600 hover:underline"
                  >
                    {apt.unit_label}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-gray-800">{apt.viewing_title}</div>
                  <div className="text-xs text-gray-400">{format(parseISO(apt.viewing_date), 'MMM d')}</div>
                </TableCell>
                <TableCell className="text-right font-semibold text-indigo-700">
                  {apt.monthly_rent ? `$${apt.monthly_rent.toLocaleString()}` : '—'}
                </TableCell>
                <TableCell className="text-center text-gray-600">
                  {apt.bedrooms ? `${apt.bedrooms}bd·${apt.bathrooms}ba` : '—'}
                </TableCell>
                <TableCell className="text-right text-gray-600">{apt.sqft ?? '—'}</TableCell>
                <TableCell className="text-gray-600">{apt.commute_note ?? '—'}</TableCell>
                <TableCell className="text-right">
                  {apt.rating ? (
                    <span className="text-amber-400">
                      {'★'.repeat(apt.rating)}{'☆'.repeat(5 - apt.rating)}
                    </span>
                  ) : '—'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
