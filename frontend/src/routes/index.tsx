import { useState } from "react"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { User, Sword } from "lucide-react"

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const navigate = useNavigate()
  const [gameName, setGameName] = useState('')
  const [tagLine, setTagLine] = useState('')
  const [championSearch, setChampionSearch] = useState('')

  function handlePlayerSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!gameName || !tagLine) return
    navigate({
      to: '/account/$gameName/$tagLine',
      params: {
        gameName,
        tagLine
      }
    })
  }

  function handleChampionSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!championSearch) return
    navigate({
      to: '/champion/$name',
      params: {
        name: championSearch
      }
    })
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] px-4 space-y-16 py-12">
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <h1 className="text-7xl font-black tracking-tighter text-foreground">
          LIGON
        </h1>
        <p className="text-muted-foreground text-xl font-medium">
          Search for any player or champion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Player Search Section */}
        <div className="relative group">
          <div className="absolute -inset-px bg-primary/10 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-card border border-border/50 rounded-2xl p-8 transition-all duration-300 space-y-6 flex flex-col h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/5 rounded-xl">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Player Search</h2>
                <p className="text-sm text-muted-foreground">Find a summoner profile</p>
              </div>
            </div>
            <form onSubmit={handlePlayerSearch} className="space-y-4 mt-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Game Name"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="flex-1 h-14 bg-background border-border/50 focus:ring-1 focus:ring-primary/20 text-lg shadow-none"
                />
                <Input
                  placeholder="#Tag"
                  value={tagLine}
                  onChange={(e) => setTagLine(e.target.value)}
                  className="w-28 h-14 bg-background border-border/50 focus:ring-1 focus:ring-primary/20 text-lg shadow-none"
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-bold transition-all bg-primary hover:bg-primary/90 text-primary-foreground shadow-none">
                View Profile
              </Button>
            </form>
          </div>
        </div>

        {/* Champion Search Section */}
        <div className="relative group">
          <div className="absolute -inset-px bg-sky-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-card border border-border/50 rounded-2xl p-8 transition-all duration-300 space-y-6 flex flex-col h-full">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-500/5 rounded-xl">
                <Sword className="w-8 h-8 text-sky-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Champion Search</h2>
                <p className="text-sm text-muted-foreground">Analyze champion stats</p>
              </div>
            </div>
            <form onSubmit={handleChampionSearch} className="space-y-4 mt-auto">
              <Input
                placeholder="Search champion..."
                value={championSearch}
                onChange={(e) => setChampionSearch(e.target.value)}
                className="h-14 bg-background border-border/50 focus:ring-1 focus:ring-primary/20 text-lg shadow-none"
              />
              <Button type="submit" className="w-full h-14 text-lg font-bold transition-all bg-sky-500 hover:bg-sky-600 text-white shadow-none border-none">
                View Champion
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
