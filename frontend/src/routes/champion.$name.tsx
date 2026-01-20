import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getChampionStats, type ChampionStats } from '../lib/api'
import { getChampionIconUrl, getItemIconUrl } from '../lib/getIcons'
import { cn } from '../lib/utils'
import { Swords, Zap, TrendingUp, BarChart3, Info, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

export const Route = createFileRoute('/champion/$name')({
  component: RouteComponent,
})

function RouteComponent() {
  const { name } = Route.useParams()
  const [stats, setStats] = useState<ChampionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchupSort, setMatchupSort] = useState<{ key: 'championName' | 'winrate' | 'playrate', direction: 'asc' | 'desc' }>({ key: 'winrate', direction: 'desc' })
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchStats() {
      const data = await getChampionStats(name)
      setStats(data)
      setLoading(false)
    }
    fetchStats()
  }, [name])

  const sortedMatchups = useMemo(() => {
    if (!stats) return []
    return [...stats.matchups].sort((a, b) => {
      const aValue = a[matchupSort.key]
      const bValue = b[matchupSort.key]
      if (aValue < bValue) return matchupSort.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return matchupSort.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [stats, matchupSort])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  const handleMatchupSort = (key: 'championName' | 'winrate' | 'playrate') => {
    setMatchupSort(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  if (!stats) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Champion not found</h1>
        <Link to="/" className="text-primary hover:underline mt-4 inline-block">Back to Home</Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="relative group overflow-hidden rounded-3xl border border-border/50 bg-card/60 backdrop-blur-md p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/10 transition-colors duration-700"></div>
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-tr from-primary to-sky-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <img
              src={getChampionIconUrl(stats.name)}
              alt={stats.name}
              className="relative w-32 h-32 rounded-2xl border-2 border-primary/20"
            />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h1 className="text-5xl font-black tracking-tighter uppercase">{stats.name}</h1>
            <p className="text-xl text-muted-foreground font-medium italic">{stats.title}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Win Rate" value={`${stats.winrate.toFixed(2)}%`} icon={TrendingUp} color="text-emerald-500" />
        <StatCard label="Pick Rate" value={`${stats.playrate.toFixed(2)}%`} icon={Zap} color="text-sky-500" />
        <StatCard label="Ban Rate" value={`${stats.banrate.toFixed(2)}%`} icon={BarChart3} color="text-rose-500" />
        <StatCard label="Avg KDA" value={`${stats.avgKills.toFixed(1)} / ${stats.avgDeaths.toFixed(2)} / ${stats.avgAssists.toFixed(2)}`} icon={Swords} color="text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Core items builds (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 px-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Core Item Builds</h2>
          </div>
          <div className="space-y-4">
            {stats.coreBuilds.map((build, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-border/50 bg-card/40 hover:bg-card/60 transition-all group">
                <div className="flex items-center gap-3">
                  {build.items.map((itemId, j) => (
                    <div key={j} className="relative">
                      <img src={getItemIconUrl(itemId)} className="w-12 h-12 rounded-xl border border-border/50" alt="Item" />
                      {j < 2 && <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xl">›</span>}
                    </div>
                  ))}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-lg font-bold text-emerald-500">{build.winrate.toFixed(2)}% WR</p>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{build.playrate.toFixed(2)}% Played</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Situational items (1/3 width) */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Info className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Situational</h2>
          </div>
          <div className="bg-card/40 rounded-3xl border border-border/50 p-6 space-y-4">
            {stats.situationalItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <img src={getItemIconUrl(item.itemId)} className="w-10 h-10 rounded-lg border border-border/50 group-hover:scale-105 transition-transform" alt="Item" />
                  <div className="w-24 h-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${item.winrate}%` }}></div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{item.winrate.toFixed(2)}%</p>
                  <p className="text-[10px] text-muted-foreground uppercase">{item.playrate.toFixed(2)}% Rate</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matchups Section */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center gap-2 px-2">
            <Swords className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">Matchups</h2>
          </div>
          <div className="bg-card/40 rounded-3xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors" onClick={() => handleMatchupSort('championName')}>
                    <div className="flex items-center gap-1">
                      Champion {matchupSort.key === 'championName' ? (matchupSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleMatchupSort('winrate')}>
                    <div className="flex items-center gap-1 justify-end">
                      Win Rate {matchupSort.key === 'winrate' ? (matchupSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </TableHead>
                  <TableHead className="cursor-pointer hover:text-primary transition-colors text-right" onClick={() => handleMatchupSort('playrate')}>
                    <div className="flex items-center gap-1 justify-end">
                      Matchup Rate {matchupSort.key === 'playrate' ? (matchupSort.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMatchups.map((matchup) => (
                  <TableRow key={matchup.championId} className="hover:bg-muted/40 transition-colors group cursor-pointer" onClick={() => navigate({ to: '/champion/$name', params: { name: matchup.championId } })}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <img src={getChampionIconUrl(matchup.championId)} alt={matchup.championName} className="w-8 h-8 rounded-lg border border-border/50" />
                        <span className="font-bold">{matchup.championName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("font-mono font-bold", matchup.winrate > 50 ? "text-emerald-500" : "text-rose-500")}>
                        {matchup.winrate.toFixed(2)}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {matchup.playrate.toFixed(2)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-2 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</span>
        <Icon className={cn("w-4 h-4", color)} />
      </div>
      <p className="text-2xl font-black">{value}</p>
    </div>
  )
}
