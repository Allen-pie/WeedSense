import { Leaf, Github} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Link } from "react-router-dom"

export default function Footer(){
    return (
         <footer className="border-t border-outline  px-14 py-8">
        <div className="container mx-auto  px-14 py-8 ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-500" />
                <h3 className="text-lg font-semibold text-green-500">Weed
                  {" "}<span className="text-foreground">Sense</span>
                </h3>
              </div>
              <p className="text-gray-400 text-sm">
                Advanced weed identification and segmentation tool powered by AI.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-gray-400 hover:text-green-500 transition-colors">
                  <Github className="h-5 w-5" />
                  <span className="sr-only">GitHub</span>
                </a>
                
              </div>
            </div>

            {/* <div>
              <h3 className="text-sm font-medium text-secondary-foreground mb-4">About</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to={'/about'} className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                    About Us
                  </Link>
                </li>
             
              </ul>
            </div> */}

            {/* <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Resources</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Case Studies
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Tutorials
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-purple-400 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div> */}

            {/* <div>
              <h3 className="text-sm font-medium text-gray-300 mb-4">Contact</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-amber-400 transition-colors flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    <span>contact@weedseg.ai</span>
                  </a>
                </li>
                <li className="text-gray-400">
                  123 Botany Street
                  <br />
                  Plant City, PC 12345
                </li>
              </ul>
            </div> */}


          </div>

          <Separator className="my-8 bg-outline" />

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Weed Sense. All rights reserved.
            </p>
            
            
          </div>
        </div>
      </footer>
    )
}