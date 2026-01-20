import { createFileRoute, Link } from '@tanstack/react-router'
import { accountByRiotId, type AccountData, soloqByPuuid, type SoloqData, } from '../lib/api'
import { useEffect, useState } from 'react'
import { getProfileIconUrl, getTierIconUrl, getItemIconUrl, getChampionIconUrl } from "../lib/getIcons"
import { cn } from '../lib/utils'
import { Progress } from '../components/ui/progress'
export const Route = createFileRoute('/account/$gameName/$tagLine')({
  component: RouteComponent,
})

function RouteComponent() {
  const { gameName, tagLine } = Route.useParams()
  const [data, setData] = useState<AccountData | "loading" | "error" | "not found">("loading")

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await accountByRiotId(
          { param: { gameName, tagLine } },
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
  }, [gameName, tagLine])

  if (data === "loading") {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (data === "error") {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4 text-center p-4">
        <h2 className="text-3xl font-bold tracking-tight">Something went wrong</h2>
        <p className="text-muted-foreground max-w-md">We couldn't load the profile information. Please try again later.</p>
      </div>
    )
  }

  if (data === "not found") {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] gap-4 text-center p-4">
        <h2 className="text-3xl font-bold tracking-tight">Profile not found</h2>
        <p className="text-muted-foreground max-w-md">
          We couldn't find a summoner with the name <span className="font-semibold text-foreground">{gameName}#{tagLine}</span>.
        </p>
      </div>
    )
  }

  const wins = data.soloq?.wins ?? 0
  const losses = data.soloq?.losses ?? 0
  const games = wins + losses
  const winRate = games > 0 ? Math.round((wins / games) * 100) : 0
  const tier = data.soloq?.tier ?? "Unranked"
  const division = data.soloq?.rank ?? ""
  const lp = data.soloq?.leaguePoints ?? 0

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-6">

        {/* Profile Header */}
        <div className="bg-card rounded-xl border shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-20 bg-linear-to-b from-primary/10 to-transparent pointer-events-none" />

          <div className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            {/* Identity Section */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="relative">
                <img
                  src={getProfileIconUrl(data.profileIconId)}
                  alt="Profile Icon"
                  className="w-24 h-24 rounded-full border-4 border-card shadow-lg object-cover"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full border-2 border-card shadow-sm">
                  {data.summonerLevel}
                </div>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                  {data.gameName}
                  <span className="text-xl md:text-2xl text-muted-foreground font-light ml-1.5">#{data.tagLine}</span>
                </h1>
                <div className="flex items-center justify-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground ring-1 ring-inset ring-gray-500/10 uppercase tracking-wider">
                    EUNE
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch md:items-end gap-3 shrink-0 min-w-65">
              <div className="w-full flex items-center gap-4 bg-muted/30 p-3.5 rounded-xl border border-border/50 shadow-inner">
                {
                  tier === "Unranked" && (
                    <div className="flex flex-col items-center justify-center w-full h-full">
                      <p className="text-sm font-medium text-muted-foreground">Unranked</p>
                    </div>
                  )}
                {
                  tier !== "Unranked" && <img
                    src={getTierIconUrl(tier)}
                    alt={`${tier} ${division}`}
                    className="w-14 h-14 object-contain filter drop-shadow-sm"
                  />
                }



                <div className="text-left md:text-right">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">Ranked Solo</p>
                  <p className="text-xl font-black bg-clip-text text-transparent bg-linear-to-r from-foreground to-muted-foreground">
                    {tier} {division}
                  </p>
                  <p className="text-sm font-bold text-primary">{lp} LP</p>
                </div>
              </div>

              <div className="w-full space-y-1.5 bg-muted/20 p-2.5 rounded-lg border border-border/30">
                <div className="flex justify-between items-end text-xs font-medium">
                  <span className={cn(
                    "text-sm font-bold leading-none",
                    winRate >= 50 ? "text-success" : "text-destructive"
                  )}>{winRate}% WR</span>
                  <span className="text-[10px] text-muted-foreground">{wins}W - {games - wins}L</span>
                </div>
                <Progress value={winRate} className="h-1.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Now Full Width Content */}
        <div className="grid grid-cols-1 gap-4">
          <MatchList puuid={data.puuid} />
        </div>
      </div>
    </div>
  )
}

function MatchList({ puuid }: { puuid: string }) {
  const [matches, setMatches] = useState<SoloqData>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMatches = async () => {
      console.log("Fetching matches for PUUID:", puuid)
      setLoading(true)
      try {
        const res = await soloqByPuuid({ param: { puuid } })
        console.log("Response status:", res.status)
        if (res.ok) {
          const data = await res.json()
          console.log("Fetched matches count:", data?.length)
          setMatches(data)
        } else {
          console.error("Failed to fetch matches. Status:", res.status)
        }
      } catch (error) {
        console.error("Failed to fetch matches:", error)
      } finally {
        setLoading(false)
      }
    }
    if (puuid) {
      fetchMatches()
    } else {
      console.warn("MatchList received empty PUUID")
      setLoading(false)
    }
  }, [puuid])

  if (loading) {
    return (
      <div className="bg-card p-12 rounded-xl border shadow-sm flex flex-col items-center justify-center gap-4">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-muted-foreground font-medium">Loading match history...</p>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="bg-card p-12 rounded-xl border shadow-sm flex flex-col items-center justify-center text-center gap-2 border-dashed">
        <p className="text-lg font-bold text-foreground">No matches found</p>
        <p className="text-sm text-muted-foreground">This summoner hasn't played any recent solo queue games.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold px-1">Recent Match History</h2>
      <div className="flex flex-col gap-3">
        {matches.map((match) => {
          if (!match) return null
          const participant = match.extra.info.participants.find(p => p.puuid === puuid)
          if (!participant) return null

          const isWin = participant.win
          const durationMinutes = Math.floor(match.extra.info.gameDuration / 60)
          const kda = ((participant.kills! + participant.assists!) / Math.max(1, participant.deaths!)).toFixed(2)

          return (
            <Link
              key={match.matchId}
              to="/match/$matchId"
              params={{ matchId: match.matchId } as any}
              className={cn(
                "group relative overflow-hidden bg-card hover:bg-muted/50 transition-all rounded-xl border-l-4 shadow-sm h-24 flex items-center p-3 md:p-4",
                isWin ? "border-sky-500" : "border-rose-500"
              )}
            >
              {/* Win/Loss Indicator overlay for background */}
              <div className={cn(
                "absolute inset-0 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity",
                isWin ? "bg-sky-500" : "bg-rose-500"
              )} />

              <div className="flex flex-1 items-center justify-between gap-4 relative z-10">
                {/* Result & Champion Info */}
                <div className="flex items-center gap-4 min-w-40">
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-xs font-black uppercase tracking-wider",
                      isWin ? "text-sky-600 dark:text-sky-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {isWin ? "Victory" : "Defeat"}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {durationMinutes}m • {match.extra.info.gameMode}
                    </span>
                  </div>

                  <div className="relative">
                    <img
                      src={getChampionIconUrl(participant.championName ?? "Unknown")}
                      alt={participant.championName}
                      className="w-12 h-12 rounded-lg border border-border shadow-sm group-hover:scale-105 transition-transform"
                    />
                  </div>
                </div>

                {/* Score & KDA */}
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1.5 text-base font-black tracking-tight">
                    <span>{participant.kills}</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span className="text-destructive">{participant.deaths}</span>
                    <span className="text-muted-foreground/50">/</span>
                    <span>{participant.assists}</span>
                  </div>
                  <div className="text-xs font-bold text-muted-foreground">
                    <span className={cn(
                      parseFloat(kda) >= 3 ? "text-primary" : "text-muted-foreground"
                    )}>{kda}</span>
                    <span className="font-medium ml-1">KDA</span>
                  </div>
                </div>

                {/* Items Placeholder / More info */}
                <div className="hidden md:flex items-center gap-1 overflow-hidden">
                  {[participant.item0, participant.item1, participant.item2, participant.item3, participant.item4, participant.item5].map((item, idx) => (
                    <div key={idx} className="w-8 h-8 rounded bg-muted/50 border border-border/50">
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

                {/* Arrow */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground pr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6" /></svg>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}