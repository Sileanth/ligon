import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { getChallengerPlayers, type TopPlayer } from '../lib/api'
import { getProfileIconUrl } from '../lib/getIcons'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table"
import { cn } from '../lib/utils'
import { Trophy, Users, TrendingUp, Hash, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export const Route = createFileRoute('/players')({
    component: RouteComponent,
})

function RouteComponent() {
    const [players, setPlayers] = useState<TopPlayer[]>([])
    const [loading, setLoading] = useState(true)
    const [sortConfig, setSortConfig] = useState<{ key: keyof TopPlayer, direction: 'asc' | 'desc' } | null>({ key: 'lp', direction: 'desc' })
    const navigate = useNavigate()

    useEffect(() => {
        async function loadData() {
            try {
                const result = await getChallengerPlayers()
                setPlayers(result)
            } catch (error) {
                console.error('Failed to load players:', error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    const sortedPlayers: TopPlayer[] = useMemo(() => {
        if (!sortConfig) return players
        return [...players].sort((a, b) => {
            let aValue: any = a[sortConfig.key]
            let bValue: any = b[sortConfig.key]

            if (sortConfig.key === 'wins') {
                aValue = a.wins + a.losses
                bValue = b.wins + b.losses
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
            }
            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1
            return 0
        })
    }, [players, sortConfig])

    const handleSort = (key: keyof TopPlayer) => {
        setSortConfig(prev => ({
            key,
            direction: prev?.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }))
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4 space-y-8 max-w-6xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500/10 rounded-lg">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight uppercase italic">Top Players</h1>
                    </div>
                    <p className="text-muted-foreground text-lg">Challenger rankings for the current season.</p>
                </div>

                <div className="flex gap-4">
                    <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-center gap-4">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Region</p>
                            <p className="text-sm font-black">EUNE</p>
                        </div>
                    </div>
                    <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-4 flex items-center gap-4">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Queue</p>
                            <p className="text-sm font-black">Solo/Duo</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card/40 backdrop-blur-md rounded-3xl border border-border/50 overflow-hidden shadow-2xl shadow-primary/5">
                <Table>
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-border/50">
                            <TableHead className="w-[80px] text-center"><Hash className="w-4 h-4 mx-auto" /></TableHead>
                            <TableHead className="min-w-[250px]">Player</TableHead>
                            <TableHead className="text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('level')}>
                                <div className="flex items-center justify-end gap-1">
                                    Level {sortConfig?.key === 'level' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </TableHead>
                            <TableHead className="text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('lp')}>
                                <div className="flex items-center justify-end gap-1">
                                    LP {sortConfig?.key === 'lp' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </TableHead>
                            <TableHead className="text-center cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('winrate')}>
                                <div className="flex items-center justify-center gap-1">
                                    Win Rate {sortConfig?.key === 'winrate' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </TableHead>
                            <TableHead className="text-right cursor-pointer hover:text-primary transition-colors" onClick={() => handleSort('wins')}>
                                <div className="flex items-center justify-end gap-1">
                                    Games {sortConfig?.key === 'wins' ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-30" />}
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedPlayers.map((player, index) => (
                            <TableRow
                                key={player.puuid}
                                className="hover:bg-muted/40 transition-all group cursor-pointer border-border/50"
                                onClick={() => navigate({ to: '/account/$gameName/$tagLine', params: { gameName: player.name, tagLine: player.tag } })}
                            >
                                <TableCell className="text-center">
                                    <span className={cn(
                                        "font-black text-lg",
                                        index === 0 && sortConfig?.key === 'lp' && sortConfig.direction === 'desc' && "text-yellow-500 text-2xl drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]",
                                        index === 1 && sortConfig?.key === 'lp' && sortConfig.direction === 'desc' && "text-slate-300 text-xl",
                                        index === 2 && sortConfig?.key === 'lp' && sortConfig.direction === 'desc' && "text-amber-600 text-xl",
                                        index > 2 && "text-muted-foreground/60"
                                    )}>
                                        {index + 1}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <div className="relative shrink-0">
                                            <div className="absolute -inset-1 bg-primary/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
                                            <img
                                                src={getProfileIconUrl(player.profileIconId)}
                                                alt={player.name}
                                                className="relative w-12 h-12 rounded-xl border border-border/50 shadow-inner"
                                            />
                                            {index < 3 && sortConfig?.key === 'lp' && sortConfig.direction === 'desc' && (
                                                <div className="absolute -top-2 -right-2 bg-background border border-border rounded-full p-1 shadow-lg">
                                                    <Trophy className={cn(
                                                        "w-3 h-3",
                                                        index === 0 && "text-yellow-500",
                                                        index === 1 && "text-slate-300",
                                                        index === 2 && "text-amber-600"
                                                    )} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                                                {player.name}
                                            </span>
                                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                                                #{player.tag}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-muted-foreground">
                                    {player.level}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="text-lg font-black text-primary">{player.lp.toLocaleString()}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">League Points</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className={cn(
                                            "text-base font-bold px-3 py-1 rounded-full",
                                            player.winrate >= 55 ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" :
                                                player.winrate >= 50 ? "bg-sky-500/10 text-sky-500 border border-sky-500/20" :
                                                    "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                        )}>
                                            {player.winrate.toFixed(1)}%
                                        </span>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground">
                                            <span className="text-emerald-500/80">{player.wins}W</span>
                                            <span className="text-rose-500/80">{player.losses}L</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-right font-mono text-base font-medium text-muted-foreground">
                                    {(player.wins + player.losses).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
