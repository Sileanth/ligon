import { createFileRoute, Link } from '@tanstack/react-router'
import { matchByMatchId, type MatchData } from '../lib/api'
import { useEffect, useState } from 'react'
import { getChampionIconUrl, getItemIconUrl, getRuneIconUrl, getRuneData, getSummonerSpellIconUrl, getSummonerSpellData } from '../lib/getIcons'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/match/$matchId')({
    component: RouteComponent,
})

function RouteComponent() {
    const { matchId } = Route.useParams() as { matchId: string }
    const [data, setData] = useState<MatchData | "loading" | "error" | "not found">("loading")

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await matchByMatchId(
                    { param: { matchId } },
                    {
                        init: {
                            signal: AbortSignal.timeout(5000),
                        },
                    })
                if (result.status === 404) {
                    setData("not found")
                    return
                }
                if (!result.ok) {
                    setData("error")
                    return
                }
                const data = await result.json()
                setData(data)
            } catch (error) {
                setData("error")
            }
        }
        fetchData()
    }, [matchId])

    if (data === "loading") {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <p className="text-muted-foreground font-medium">Loading match...</p>
                </div>
            </div>
        )
    }

    if (data === "error") {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4 text-center p-4">
                <h2 className="text-3xl font-bold tracking-tight">Something went wrong</h2>
                <p className="text-muted-foreground max-w-md">We couldn't load the match information. Please try again later.</p>
            </div>
        )
    }

    if (data === "not found") {
        return (
            <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4 text-center p-4">
                <h2 className="text-3xl font-bold tracking-tight">Match not found</h2>
                <p className="text-muted-foreground max-w-md">
                    We couldn't find a match with ID <span className="font-mono text-foreground">{matchId}</span>.
                </p>
            </div>
        )
    }

    const matchInfo = data.raw as any
    const participants = matchInfo.info.participants
    const team100 = participants.filter((p: any) => p.teamId === 100)
    const team200 = participants.filter((p: any) => p.teamId === 200)
    const team100Win = team100[0]?.win ?? false
    const durationMinutes = Math.floor(matchInfo.info.gameDuration / 60)
    const durationSeconds = matchInfo.info.gameDuration % 60

    return (
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <div className="space-y-6">
                {/* Match Header */}
                <div className="bg-card rounded-xl border p-6">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-extrabold tracking-tight">{matchInfo.info.gameMode}</h1>
                        <p className="text-muted-foreground flex items-center justify-center gap-4 text-sm">
                            <span>
                                Played: <span className="font-semibold">{new Date(matchInfo.info.gameCreation).toLocaleDateString()} {new Date(matchInfo.info.gameCreation).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                            <span>
                                Duration: <span className="font-semibold">{durationMinutes}m {durationSeconds}s</span>
                            </span>
                        </p>
                    </div>
                </div>

                {/* Teams */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <TeamDisplay team={team100} isWin={team100Win} teamColor="Blue" />
                    <TeamDisplay team={team200} isWin={!team100Win} teamColor="Red" />
                </div>
            </div>
        </div>
    )
}

interface ParticipantData {
    puuid: string
    riotIdGameName?: string
    riotIdTagline?: string
    championName?: string
    kills?: number
    deaths?: number
    assists?: number
    item0?: number
    item1?: number
    item2?: number
    item3?: number
    item4?: number
    item5?: number
    item6?: number
    totalMinionsKilled?: number
    neutralMinionsKilled?: number
    champLevel?: number
    teamId?: number
    win?: boolean
    goldEarned?: number
    totalDamageDealtToChampions?: number
    totalDamageTaken?: number
    wardsPlaced?: number
    wardsKilled?: number
    visionScore?: number
    totalHeal?: number
    damageSelfMitigated?: number
    summoner1Id?: number
    summoner2Id?: number
    perks?: {
        styles?: Array<{
            style?: number
            selections?: Array<{
                perk?: number
            }>
        }>
    }
}

function TeamDisplay({ team, isWin, teamColor }: { team: ParticipantData[], isWin: boolean, teamColor: string }) {
    const totalKills = team.reduce((sum, p) => sum + (p.kills ?? 0), 0)
    const totalGold = team.reduce((sum, p) => sum + (p.goldEarned ?? 0), 0)
    const [expandedPuuid, setExpandedPuuid] = useState<string | null>(null)

    return (
        <div className={cn(
            "bg-card rounded-xl border-2 overflow-hidden",
            isWin ? "border-sky-500/50" : "border-rose-500/50"
        )}>
            {/* Team Header */}
            <div className={cn(
                "px-4 py-3 flex items-center justify-between",
                isWin ? "bg-sky-500/10" : "bg-rose-500/10"
            )}>
                <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold">{teamColor} Team</h2>
                    <span className={cn(
                        "text-xs font-black uppercase tracking-wider px-2 py-0.5 rounded",
                        isWin ? "bg-sky-500 text-white" : "bg-rose-500 text-white"
                    )}>
                        {isWin ? "Victory" : "Defeat"}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground">
                    <span>{totalKills} kills</span>
                    <span className="text-yellow-600 dark:text-yellow-500">{(totalGold / 1000).toFixed(1)}k gold</span>
                </div>
            </div>

            {/* Participants */}
            <div className="divide-y divide-border">
                {team.map((participant) => (
                    <ParticipantRow
                        key={participant.puuid}
                        participant={participant}
                        isExpanded={expandedPuuid === participant.puuid}
                        onToggleExpand={() => setExpandedPuuid(expandedPuuid === participant.puuid ? null : participant.puuid)}
                    />
                ))}
            </div>
        </div>
    )
}

function ParticipantRow({ participant, isExpanded, onToggleExpand }: {
    participant: ParticipantData
    isExpanded: boolean
    onToggleExpand: () => void
}) {
    const kda = ((participant.kills! + participant.assists!) / Math.max(1, participant.deaths!)).toFixed(2)
    const cs = (participant.totalMinionsKilled ?? 0) + (participant.neutralMinionsKilled ?? 0)

    return (
        <div>
            {/* Main Row */}
            <div
                className="p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-3">
                    {/* Champion Icon */}
                    <Link
                        to="/champion/$name"
                        params={{ name: participant.championName ?? "Unknown" }}
                        className="shrink-0 hover:scale-105 transition-transform"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={getChampionIconUrl(participant.championName ?? "Unknown")}
                            alt={participant.championName}
                            className="w-12 h-12 rounded-lg border border-border"
                        />
                    </Link>

                    {/* Summoner Spells */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                        {participant.summoner1Id !== undefined && (
                            <img
                                src={getSummonerSpellIconUrl(participant.summoner1Id)}
                                alt="Summoner Spell 1"
                                title={(() => {
                                    const spell = getSummonerSpellData(participant.summoner1Id)
                                    return spell ? `${spell.name}: ${spell.description}` : undefined
                                })()}
                                className="w-[22px] h-[22px] rounded border border-border/50 cursor-help"
                            />
                        )}
                        {participant.summoner2Id !== undefined && (
                            <img
                                src={getSummonerSpellIconUrl(participant.summoner2Id)}
                                alt="Summoner Spell 2"
                                title={(() => {
                                    const spell = getSummonerSpellData(participant.summoner2Id)
                                    return spell ? `${spell.name}: ${spell.description}` : undefined
                                })()}
                                className="w-[22px] h-[22px] rounded border border-border/50 cursor-help"
                            />
                        )}
                    </div>

                    {/* Player Name */}
                    <div className="flex-1 min-w-0">
                        <Link
                            to="/account/$gameName/$tagLine"
                            params={{
                                gameName: participant.riotIdGameName ?? "Unknown",
                                tagLine: participant.riotIdTagline ?? "Unknown"
                            }}
                            className="font-semibold text-sm hover:text-primary transition-colors flex flex-wrap items-center gap-x-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <span>{participant.riotIdGameName}</span>
                            <span className="text-muted-foreground font-normal">#{participant.riotIdTagline}</span>
                        </Link>
                        <div className="text-xs text-muted-foreground">
                            Level {participant.champLevel}
                        </div>
                    </div>

                    {/* KDA */}
                    <div className="flex flex-col items-center text-center shrink-0">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                            <span>{participant.kills}</span>
                            <span className="text-muted-foreground/50">/</span>
                            <span className="text-destructive">{participant.deaths}</span>
                            <span className="text-muted-foreground/50">/</span>
                            <span>{participant.assists}</span>
                        </div>
                        <div className="text-xs font-medium">
                            <span className={cn(
                                parseFloat(kda) >= 3 ? "text-primary font-bold" : "text-muted-foreground"
                            )}>
                                {kda} KDA
                            </span>
                        </div>
                    </div>

                    {/* Gold */}
                    <div className="text-sm font-medium text-yellow-600 dark:text-yellow-500 shrink-0 hidden sm:block">
                        {((participant.goldEarned ?? 0) / 1000).toFixed(1)}k
                    </div>

                    {/* CS */}
                    <div className="text-sm font-medium text-muted-foreground shrink-0 hidden md:block">
                        {cs} CS
                    </div>

                    {/* Items */}
                    <div className="hidden lg:flex items-center gap-1 shrink-0">
                        {[participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5, participant.item6].map((item, idx) => (
                            <div key={idx} className="w-7 h-7 rounded bg-muted/50 border border-border/50">
                                {item !== undefined && item > 0 && (
                                    <img
                                        src={getItemIconUrl(item)}
                                        alt={`Item ${item}`}
                                        className="w-full h-full rounded"
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Expand Indicator */}
                    <div className="shrink-0 text-muted-foreground">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className={cn("transition-transform", isExpanded && "rotate-180")}
                        >
                            <path d="m6 9 6 6 6-6" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-3 pb-3 pt-0 bg-muted/20 space-y-3">
                    {/* Runes */}
                    {participant.perks?.styles && participant.perks.styles.length > 0 && (
                        <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Runes</h4>
                            <div className="flex items-center gap-3">
                                {/* Keystone */}
                                {participant.perks.styles[0]?.selections?.[0]?.perk && (
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="relative">
                                            {(() => {
                                                const perkId = participant.perks.styles[0].selections[0].perk
                                                const runeData = getRuneData(perkId)
                                                return (
                                                    <img
                                                        src={getRuneIconUrl(perkId)}
                                                        alt={runeData?.name || "Keystone"}
                                                        title={runeData ? `${runeData.name}: ${runeData.shortDesc}` : undefined}
                                                        className="w-12 h-12 rounded-full bg-black/10 p-1 cursor-help"
                                                    />
                                                )
                                            })()}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground font-semibold">Keystone</span>
                                    </div>
                                )}
                                {/* Primary Runes */}
                                {participant.perks.styles[0]?.selections?.slice(1, 4).map((sel, idx) => {
                                    if (!sel?.perk) return null
                                    const runeData = getRuneData(sel.perk)
                                    return (
                                        <img
                                            key={idx}
                                            src={getRuneIconUrl(sel.perk)}
                                            alt={runeData?.name || `Primary ${idx + 1}`}
                                            title={runeData ? `${runeData.name}: ${runeData.shortDesc}` : undefined}
                                            className="w-7 h-7 rounded-full bg-black/10 p-0.5 cursor-help"
                                        />
                                    )
                                })}
                                <div className="w-px h-8 bg-border mx-1" />
                                {/* Secondary Runes */}
                                {participant.perks.styles[1]?.selections?.slice(0, 2).map((sel, idx) => {
                                    if (!sel?.perk) return null
                                    const runeData = getRuneData(sel.perk)
                                    return (
                                        <img
                                            key={idx}
                                            src={getRuneIconUrl(sel.perk)}
                                            alt={runeData?.name || `Secondary ${idx + 1}`}
                                            title={runeData ? `${runeData.name}: ${runeData.shortDesc}` : undefined}
                                            className="w-8 h-8 rounded-full bg-black/10 p-0.5 cursor-help"
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 bg-card/50 rounded-lg border border-border/50">
                        <StatItem label="Damage to Champions" value={(participant.totalDamageDealtToChampions ?? 0).toLocaleString()} />
                        <StatItem label="Damage Taken" value={(participant.totalDamageTaken ?? 0).toLocaleString()} />
                        <StatItem label="Gold Earned" value={(participant.goldEarned ?? 0).toLocaleString()} />
                        <StatItem label="Wards Placed" value={participant.wardsPlaced ?? 0} />
                        <StatItem label="Wards Killed" value={participant.wardsKilled ?? 0} />
                        <StatItem label="Vision Score" value={participant.visionScore ?? 0} />
                        <StatItem label="Total Healing" value={(participant.totalHeal ?? 0).toLocaleString()} />
                        <StatItem label="Damage Mitigated" value={(participant.damageSelfMitigated ?? 0).toLocaleString()} />
                    </div>
                </div>
            )}
        </div>
    )
}

function StatItem({ label, value }: { label: string, value: string | number }) {
    return (
        <div className="flex flex-col">
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
            <span className="text-sm font-bold">{value}</span>
        </div>
    )
}
