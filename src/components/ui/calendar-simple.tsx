import * as React from "react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface CalendarSimpleProps {
  selected?: Date
  onSelect?: (date: Date) => void
  className?: string
  modifiers?: {
    hasTask?: Date[]
  }
  modifiersStyles?: {
    hasTask?: React.CSSProperties
  }
}

export function CalendarSimple({
  selected,
  onSelect,
  className,
  modifiers,
  modifiersStyles
}: CalendarSimpleProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const daysInMonth = React.useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const isSelectedDay = (day: Date) => {
    return selected ? isSameDay(day, selected) : false
  }

  const isTaskDay = (day: Date) => {
    return modifiers?.hasTask ? 
      modifiers.hasTask.some(taskDate => isSameDay(day, taskDate)) : false
  }

  return (
    <div className={cn("p-3", className)}>
      <div className="flex justify-between items-center mb-4">
        <Button 
          onClick={handlePrevMonth} 
          variant="outline" 
          size="icon" 
          className="h-7 w-7"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="font-medium">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </div>
        <Button 
          onClick={handleNextMonth} 
          variant="outline" 
          size="icon"
          className="h-7 w-7"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
          <div key={i} className="text-muted-foreground text-xs">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {Array(new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          1
        ).getDay()).fill(null).map((_, i) => (
          <div key={`empty-start-${i}`} className="h-9 w-9" />
        ))}
        
        {daysInMonth.map((day) => {
          const isSelected = isSelectedDay(day)
          const hasTask = isTaskDay(day)
          
          return (
            <Button
              key={day.toString()}
              variant={isSelected ? "default" : "ghost"}
              size="icon"
              className={cn(
                "h-9 w-9 p-0 font-normal",
                hasTask && !isSelected && "bg-primary/10 text-primary-foreground font-bold"
              )}
              style={hasTask ? modifiersStyles?.hasTask : undefined}
              onClick={() => onSelect && onSelect(day)}
            >
              {day.getDate()}
            </Button>
          )
        })}
      </div>
    </div>
  )
}