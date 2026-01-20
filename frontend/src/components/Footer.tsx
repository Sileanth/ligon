
export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background py-8 mt-auto">
      <div className="container max-w-screen-2xl mx-auto px-4">
        <div className="flex flex-col gap-4 text-sm text-muted-foreground">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">LIGON</span>
              <span className="opacity-60">•</span>
              <span>Built for the Rift</span>
            </div>
            <div className="flex flex-col md:flex-row gap-2 md:gap-6 items-center">
              <span className="opacity-70">
                © {new Date().getFullYear()} LIGON. All rights reserved.
              </span>
            </div>
          </div>
          <p className="text-[11px] leading-relaxed opacity-80 text-center max-w-3xl mx-auto">
            LIGON was created under Riot Games' "Legal Jibber Jabber" policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.
          </p>
        </div>
      </div>
    </footer>
  )
}