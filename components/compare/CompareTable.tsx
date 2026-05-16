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

type SortKey = 'viewing_date' | 'monthly_rent' | 'sqft' | 'rating' | 'commute_mins'
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
        className={`cursor-pointer select-none text-right whitespace-nowrap font-bold ${
          active ? 'text-[#FF385C]' : 'text-[#717171] hover:text-[#222222]'
        }`}
      >
        {label} {active ? (sortDir === 'asc' ? '↑' : '↓') : <span className="opacity-40">↕</span>}
      </TableHead>
    )
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-[#EBEBEB] shadow-sm bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-[#F7F7F7] border-b border-[#EBEBEB]">
            <TableHead className="font-bold text-[#222222]">Unit</TableHead>
            <TableHead className="font-bold text-[#222222]">Viewing</TableHead>
            <SortHead label="Rent" k="monthly_rent" />
            <TableHead className="text-center font-bold text-[#222222]">Rooms</TableHead>
            <SortHead label="Sqft" k="sqft" />
            <SortHead label="Commute" k="commute_mins" />
            <SortHead label="Rating" k="rating" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((apt, i) => {
            const isTop = apt.rating === maxRating && maxRating > 0
            return (
              <TableRow
                key={apt.id}
                className={`border-b border-[#EBEBEB] last:border-0 ${isTop ? 'bg-[#FFF5F6]' : i % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
              >
                <TableCell className="font-bold text-[#222222]">
                  <Link
                    href={`/viewings/${apt.viewing_id}/apartments/${apt.id}`}
                    className="hover:text-[#FF385C] transition-colors hover:underline"
                  >
                    {apt.unit_label}
                    {isTop && <span className="ml-1.5 text-[10px] font-bold text-[#FF385C] bg-[#FFF0F2] rounded-full px-1.5 py-0.5">Top pick</span>}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-[#222222] font-medium">{apt.viewing_title}</div>
                  <div className="text-xs text-[#AAAAAA]">{format(parseISO(apt.viewing_date), 'MMM d')}</div>
                </TableCell>
                <TableCell className="text-right font-bold text-[#222222]">
                  {apt.monthly_rent ? `$${apt.monthly_rent.toLocaleString()}` : <span className="text-[#AAAAAA]">—</span>}
                </TableCell>
                <TableCell className="text-center text-[#717171]">
                  {apt.bedrooms ? `${apt.bedrooms}bd · ${apt.bathrooms}ba` : <span className="text-[#AAAAAA]">—</span>}
                </TableCell>
                <TableCell className="text-right text-[#717171]">{apt.sqft ?? <span className="text-[#AAAAAA]">—</span>}</TableCell>
                <TableCell className="text-right text-[#717171]">
                  {apt.commute_mins ? `${apt.commute_mins} min` : <span className="text-[#AAAAAA]">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  {apt.rating ? (
                    <div className="flex items-center justify-end gap-0.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#FF385C" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                      <span className="font-bold text-[#222222]">{apt.rating}</span>
                    </div>
                  ) : <span className="text-[#AAAAAA]">—</span>}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
