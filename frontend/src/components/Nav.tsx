import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Link } from "@tanstack/react-router"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Search } from "lucide-react"

export function Navbar() {
    const navigate = useNavigate()
    const [gameName, setGameName] = useState('')
    const [tagLine, setTagLine] = useState('')
    const [championSearch, setChampionSearch] = useState('')
    function handlePlayerSearch(e: React.FormEvent) {
        e.preventDefault()
        setGameName('')
        setTagLine('')
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
        setChampionSearch('')
        navigate({
            to: '/champion/$name',
            params: {
                name: championSearch
            }
        })
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center gap-4 px-4 w-full justify-between max-w-screen-2xl mx-auto">
                <div className="flex gap-8 items-center">
                    <Link to="/" className="text-xl font-bold text-primary hover:opacity-80 transition-all duration-200 transform hover:scale-105" >
                        LIGON
                    </Link>

                    <nav className="flex items-center gap-6">
                        <Link to="/tierlist" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 relative group">
                            Tierlist
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
                        </Link>
                        <Link to="/players" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-200 relative group">
                            Top Players
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full" />
                        </Link>
                    </nav>
                </div>

                <div className="flex items-center gap-4 flex-1 justify-end max-w-3xl">
                    <form onSubmit={handleChampionSearch} className="flex gap-2 group relative">
                        <Input
                            type="text"
                            placeholder="Search champion..."
                            value={championSearch}
                            onChange={(e) => setChampionSearch(e.target.value)}
                            className="w-48 h-10 text-sm bg-muted/50 border-border/50 focus:bg-background transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                        />
                        <Button type="submit" size="icon" className="h-10 w-10 shrink-0 hover:scale-105 active:scale-95 transition-transform">
                            <Search className="h-5 w-5" />
                        </Button>
                    </form>

                    <form onSubmit={handlePlayerSearch} className="flex gap-2">
                        <div className="flex gap-0.5">
                            <Input
                                type="text"
                                placeholder="Game Name"
                                value={gameName}
                                onChange={(e) => setGameName(e.target.value)}
                                className="w-32 h-10 text-sm bg-muted/50 border-border/50 focus:bg-background transition-all duration-200 rounded-r-none focus:ring-2 focus:ring-primary/20"
                            />
                            <Input
                                type="text"
                                placeholder="Tag"
                                value={tagLine}
                                onChange={(e) => setTagLine(e.target.value)}
                                className="w-20 h-10 text-sm bg-muted/50 border-border/50 focus:bg-background transition-all duration-200 rounded-l-none border-l-0 focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <Button type="submit" size="icon" className="h-10 w-10 shrink-0 hover:scale-105 active:scale-95 transition-transform">
                            <Search className="h-5 w-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </header>
    )
}


