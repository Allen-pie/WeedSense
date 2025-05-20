import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, ChevronRight, Database, Leaf, Zap } from "lucide-react";
import { useState, useEffect } from "react";

export default function Hero(){


const TypingAnimation = ({ words }: { words: string[] }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentText, setCurrentText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(150)

  useEffect(() => {
    const timeout = setTimeout(() => {
      // Current word being typed/deleted
      const currentWord = words[currentWordIndex]

      // If deleting
      if (isDeleting) {
        setCurrentText(currentWord.substring(0, currentText.length - 1))
        setTypingSpeed(50) // Faster when deleting

        // When fully deleted
        if (currentText === "") {
          setIsDeleting(false)
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
          setTypingSpeed(150) // Reset typing speed
        }
      }
      // If typing
      else {
        setCurrentText(currentWord.substring(0, currentText.length + 1))

        // When fully typed
        if (currentText === currentWord) {
          // Pause at the end of the word
          setTypingSpeed(1200) // Wait 2 seconds before deleting
          setTimeout(() => {
            setIsDeleting(true)
            setTypingSpeed(100)
          }, 1200)
        }
      }
    }, typingSpeed)

    return () => clearTimeout(timeout)
  }, [currentText, currentWordIndex, isDeleting, typingSpeed, words])

  return (
    <span className="inline-block min-w-[180px]">
      {currentText}
      <span className="ml-2 inline-block w-6 h-12 bg-foreground animate-blink"></span>
    </span>
  )
}


    return (
      <section className="relative overflow-hidden border-b border-outline z-20">      
        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12">
            <div className="inline-flex items-center justify-center mb-4">

              {/* <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center">
                <Leaf className="h-6 w-6 text-green-400" />
              </div> */}

            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 flex flex-col">
              <span className="text-foreground">
                <TypingAnimation words={["Advanced", "AI-Powered"]} />
              </span>{" "}
              
              <span className="text-green-500">Weed Segmentation</span>{" "}
              {/* <span className="text-white">Technology</span> */}
            </h1>

            <p className="text-secondary-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8">
              Our AI-powered tool precisely identifies and segments weeds in agricultural images, helping you optimize
              crop management and reduce herbicide usage.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button 
            //   onClick={scrollToTool} 
              size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                Try It Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>

              {/* <Button variant="outline" size="lg" className="border-green-700 text-green-400 hover:bg-green-900/30">
                Learn More
              </Button> */}


            </div>

            <div className="flex justify-center gap-8 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-secondary-foreground">99% Accuracy</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-green-500" />
                <span className="text-secondary-foreground">Fast Results</span>
              </div>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                <span className="text-secondary-foreground">Secure Data</span>
              </div>
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute -inset-0.5 bg-green-500/20 rounded-xl blur-md"></div>
            <div className="relative bg-black rounded-xl border border-green-900 overflow-hidden">
              <div className="grid grid-cols-3 gap-0.5 bg-green-900/20">
                <div className="relative aspect-[4/3]">
                  {/* <Image
                    src="/placeholder.svg?height=400&width=400"
                    alt="Original weed image"
                    fill
                    className="object-cover"
                  /> */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute bottom-3 left-3 text-sm text-green-400 bg-black/70 px-2 py-1 rounded">
                    Original
                  </div>
                </div>

                <div className="relative aspect-[4/3]">
                  {/* <Image src="/segmented1.png" alt="Segmented weed image" fill className="object-cover" /> */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute bottom-3 left-3 text-sm text-green-400 bg-black/70 px-2 py-1 rounded">
                    Processing
                  </div>
                </div>

                <div className="relative aspect-[4/3]">
                  {/* <Image src="/segmented2.png" alt="Segmented weed image" fill className="object-cover" /> */}
                  <div className="absolute inset-0 bg-black/40"></div>
                  <div className="absolute bottom-3 left-3 text-sm text-green-400 bg-black/70 px-2 py-1 rounded">
                    Result
                  </div>
                </div>
              </div>

              <div className="bg-black/80 p-4 border-t border-green-900/50">
                <div className="flex justify-between items-center">
                  <div className="text-green-400 font-medium">Weed Segmentation Process</div>
                  <Button variant="link" className="text-green-400 p-0 h-auto" 
                //   onClick={scrollToTool}
                  >
                    Try it yourself <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? "bg-green-500" : "bg-green-900"}`}></div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <div className="animate-bounce bg-black/50 p-2 rounded-full border border-green-900">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-green-500"
              >
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </div>
          </div>
        </div>
      </section>
    )
}