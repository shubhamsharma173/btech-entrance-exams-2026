'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
  targetDate: string
  label: string
}

// Helper function to parse various date formats
function parseFlexibleDate(dateStr: string): Date | null {
  if (!dateStr) return null

  // Handle TBA or "expected" dates
  if (dateStr.includes('TBA') || dateStr.includes('expected')) {
    return null
  }

  // Extract first date if there are multiple phases (e.g., "2026-04-16 (Phase 1), 2026-06-04")
  const firstDateMatch = dateStr.match(/(\d{4}-\d{2}-\d{2})/)
  if (firstDateMatch) {
    return new Date(firstDateMatch[1])
  }

  // Handle "Month YYYY" format (e.g., "April 2026")
  const monthYearMatch = dateStr.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{4})/)
  if (monthYearMatch) {
    const [, month, year] = monthYearMatch
    return new Date(`${year}-${month}-01`)
  }

  // Try standard parsing
  const parsed = new Date(dateStr)
  return isNaN(parsed.getTime()) ? null : parsed
}

export default function CountdownTimer({ targetDate, label }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const parsedDate = parseFlexibleDate(targetDate)

      // Handle unparseable dates
      if (!parsedDate) {
        setTimeLeft('Check official website')
        return
      }

      const target = parsedDate.getTime()
      const now = new Date().getTime()
      const difference = target - now

      if (difference <= 0) {
        setIsExpired(true)
        setTimeLeft('Expired')
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

      if (days > 0) {
        setTimeLeft(`${days} day${days !== 1 ? 's' : ''} left`)
      } else if (hours > 0) {
        setTimeLeft(`${hours} hour${hours !== 1 ? 's' : ''} left`)
      } else {
        setTimeLeft('Less than 1 hour left')
      }
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [targetDate])

  return (
    <div className={`text-xs font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>
      {label}: {timeLeft || 'Calculating...'}
    </div>
  )
}
