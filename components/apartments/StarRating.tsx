'use client'
interface StarRatingProps {
  value: number | null
  onChange?: (rating: number) => void
  readOnly?: boolean
}

export default function StarRating({ value, onChange, readOnly = false }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange?.(star)}
          className={`text-2xl transition-transform ${readOnly ? 'cursor-default' : 'hover:scale-110 active:scale-95'} ${
            value && star <= value ? 'text-amber-400' : 'text-gray-200'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
