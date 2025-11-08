import { Button } from "./ui/button"
import PixelBlast from "./ui/PixelBlast"
import TextType from "./ui/TextType"
import Link from "next/link"

const Hero = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center py-20">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <PixelBlast 
            color="#7C7C7E" 
            className="w-full h-full"
          />
        </div>
        <div className="relative z-10 px-4 max-w-6xl mx-auto w-full flex flex-col items-center gap-6">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-b from-white to-[#7C7C7E] bg-clip-text text-transparent">
            Try asking:
          </h1>
          
          <div className="flex items-center justify-center w-full py-6">
            <TextType
              text={["Summarize chapter 3 of my textbook.",
                    "What are the key points in this research paper?",
                    "Explain this diagram from my notes.",
                    "Create flashcards from this PDF.",
                    "Quiz me on the concepts in this document.",
                    "Find contradictions in these two sources.",]}
              typingSpeed={75}
              pauseDuration={1500}
              showCursor={true}
              cursorCharacter="|"
              className="text-white text-3xl md:text-5xl font-bold text-center"
            />
          </div>

          <p className="text-white/70 text-lg md:text-xl text-center max-w-4xl leading-relaxed">
            Sudo adapts to your learning style, provides instant feedback, and helps you master any subject with intelligent guidance.
          </p>

          <Link href="/signin">
            <Button variant="secondary">
              Start Learning
              <svg 
                className="ml-2 w-5 h-5 inline-block" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
          </Link>
        </div>
    </section>
  )
}

export default Hero