import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getTierlist, type TierlistEntry } from '../lib/api'
import { getChampionIconUrl } from '../lib/getIcons'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"
import { Button } from "../components/ui/button"
import { cn } from '../lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown, Shield, Swords, Wand2, Crosshair, HelpCircle } from "lucide-react"

export const Route = createFileRoute('/tierlist')({
  component: RouteComponent,
})

const tierWeights = {
  'S+': 6,
  'S': 5,
  'A': 4,
  'B': 3,
  'C': 2,
  'D': 1
}

type SortConfig = {
  key: keyof TierlistEntry
  direction: 'asc' | 'desc'
} | null

function RouteComponent() {
  const [data, setData] = useState<TierlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRole, setSelectedRole] = useState<TierlistEntry['role'] | 'ALL'>('ALL')
  const [sortConfig, setSortConfig] = useState<SortConfig>(null)
  const navigate = useNavigate()

  useEffect(() => {
    async function loadData() {
      const result = await getTierlist()
      setData(result)
      setLoading(false)
    }
    loadData()
  }, [])

  const roles: { id: TierlistEntry['role'] | 'ALL', label: string, icon: any }[] = [
    { id: 'ALL', label: 'All Roles', icon: HelpCircle },
    { id: 'TOP', label: 'Top', icon: Shield },
    { id: 'JUNGLE', label: 'Jungle', icon: Swords },
    { id: 'MID', label: 'Mid', icon: Wand2 },
    { id: 'ADC', label: 'ADC', icon: Crosshair },
    { id: 'SUPPORT', label: 'Support', icon: Shield },
  ]

  const handleSort = (key: keyof TierlistEntry) => {
    let direction: 'asc' | 'desc' = 'desc'
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc'
    }
    setSortConfig({ key, direction })
  }

  const filteredData = useMemo(() => {
    let result = [...data]
    if (selectedRole !== 'ALL') {
      result = result.filter(item => item.role === selectedRole)
    }
    if (sortConfig) {
      result.sort((a, b) => {
        let aValue: any = a[sortConfig.key]
        let bValue: any = b[sortConfig.key]

        if (sortConfig.key === 'tier') {
          aValue = tierWeights[aValue as keyof typeof tierWeights]
          bValue = tierWeights[bValue as keyof typeof tierWeights]
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
        return 0
      })
    }
    return result
  }, [data, selectedRole, sortConfig])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-4xl font-black tracking-tight">Champion Tierlist</h1>
        <p className="text-muted-foreground">The most effective champions for the current patch.</p>
      </div>

      {/* Role Filter */}
      <div className="flex flex-wrap gap-2 p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <Button
              key={role.id}
              variant={selectedRole === role.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedRole(role.id)}
              className={cn(
                "rounded-lg gap-2 transition-all",
                selectedRole === role.id ? "" : "hover:bg-background/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {role.label}
            </Button>
          )
        })}
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border/50 overflow-hidden backdrop-blur-sm bg-card/60">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead
                className={cn(
                  "w-[80px] cursor-pointer hover:text-primary transition-colors",
                  sortConfig?.key === 'tier' && "text-primary bg-primary/5"
                )}
                onClick={() => handleSort('tier')}
              >
                <div className="flex items-center gap-1">
                  Tier {sortConfig?.key === 'tier' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </TableHead>
              <TableHead className="min-w-[200px]">Champion</TableHead>
              <TableHead>Role</TableHead>
              <TableHead
                className={cn(
                  "cursor-pointer hover:text-primary transition-colors",
                  sortConfig?.key === 'winrate' && "text-primary bg-primary/5"
                )}
                onClick={() => handleSort('winrate')}
              >
                <div className="flex items-center gap-1">
                  Win Rate {sortConfig?.key === 'winrate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </TableHead>
              <TableHead
                className={cn(
                  "cursor-pointer hover:text-primary transition-colors",
                  sortConfig?.key === 'banrate' && "text-primary bg-primary/5"
                )}
                onClick={() => handleSort('banrate')}
              >
                <div className="flex items-center gap-1">
                  Ban Rate {sortConfig?.key === 'banrate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </TableHead>
              <TableHead
                className={cn(
                  "cursor-pointer hover:text-primary transition-colors text-right",
                  sortConfig?.key === 'games' && "text-primary bg-primary/5"
                )}
                onClick={() => handleSort('games')}
              >
                <div className="flex items-center gap-1 justify-end">
                  Games {sortConfig?.key === 'games' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((entry) => (
              <TableRow
                key={`${entry.champion_id}-${entry.role}`}
                className="hover:bg-muted/40 transition-colors group cursor-pointer"
                onClick={() => navigate({ to: '/champion/$name', params: { name: entry.champion_id } })}
              >
                <TableCell>
                  <span className={cn(
                    "inline-flex items-center justify-center w-10 h-10 rounded-lg font-black text-sm border-2",
                    entry.tier === 'S+' && "bg-rose-500/10 text-rose-500 border-rose-500/20",
                    entry.tier === 'S' && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                    entry.tier === 'A' && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                    entry.tier === 'B' && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                    entry.tier === 'C' && "bg-slate-500/10 text-slate-500 border-slate-500/20",
                    entry.tier === 'D' && "bg-slate-800/10 text-slate-800 border-slate-800/20"
                  )}>
                    {entry.tier}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-primary/20 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                      <img
                        src={getChampionIconUrl(entry.champion_id)}
                        alt={entry.champion_name}
                        className="relative w-10 h-10 rounded-lg border border-border/50"
                      />
                    </div>
                    <span className="font-bold text-base">{entry.champion_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">
                    {entry.role}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-base font-medium">
                  {entry.winrate.toFixed(2)}%
                </TableCell>
                <TableCell className="font-mono text-base text-muted-foreground">
                  {entry.banrate.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right font-medium text-muted-foreground">
                  {entry.games.toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
