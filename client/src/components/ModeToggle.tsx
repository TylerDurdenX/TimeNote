"use client"

import * as React from "react"
import { Moon, Search, SearchIcon, Sun, Text } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SearchOutlined } from "@mui/icons-material"

export function ModeToggle() {
  const { setTheme } = useTheme()

  const handleClick = (value: string) => {
    setTheme(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleClick("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleClick("dark")}>
          Dark (beta)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
