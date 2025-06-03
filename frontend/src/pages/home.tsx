import type React from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useEmblaCarousel from "embla-carousel-react";
import Footer from "@/custom_components/footer";
import { DashboardHeader } from "@/custom_components/header";
import SegmentAPI from '../../apis/SegmentAPI'
import {supabase} from "../../supabase/supabase.ts";
import Hero from "@/custom_components/hero.tsx";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";

interface segmentResponse {
  message : string
  result : string
}


export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [segmentedImage, setSegmentedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [mode,setMode] = useState<string>("binary")
  const navigate = useNavigate();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [history, setHistory] = useState<
    Array<{ original: string; segmented: string }>
  >([
    {
      original: "/placeholder.svg?height=300&width=400",
      segmented: "/segmented1.png",
    },
    {
      original: "/placeholder.svg?height=300&width=400",
      segmented: "/segmented2.png",
    },
    {
      original: "/placeholder.svg?height=300&width=400",
      segmented: "/segmented3.png",
    },
    {
      original: "/placeholder.svg?height=300&width=400",
      segmented: "/segmented1.png",
    },
    {
      original: "/placeholder.svg?height=300&width=400",
      segmented: "/segmented2.png",
    },
    {
      original: "/placeholder.svg?height=300&width=400",
      segmented: "/segmented3.png",
    },
  ]);

  // Auto-scrolling carousel setup

  const scrollNext = () => {
    if (emblaApi) emblaApi.scrollNext();
  };

  const scrollPrev = () => {
    if (emblaApi) emblaApi.scrollPrev();
  };

  // Auto-scroll functionality
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;

    const startAutoScroll = () => {
      // Clear any existing interval
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);

      // Set up auto-scrolling interval
      autoScrollRef.current = setInterval(() => {
        if (!isPaused) emblaApi.scrollNext();
      }, 3000); // Scroll every 3 seconds
    };

    // Initialize auto-scrolling
    startAutoScroll();

    // Add event listeners for mouse interactions
    const onMouseEnter = () => setIsPaused(true);
    const onMouseLeave = () => setIsPaused(false);

    const carousel = emblaRef.current;
    if (carousel) {
      carousel.addEventListener("mouseenter", onMouseEnter);
      carousel.addEventListener("mouseleave", onMouseLeave);
    }

    // Clean up on unmount
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      if (carousel) {
        carousel.removeEventListener("mouseenter", onMouseEnter);
        carousel.removeEventListener("mouseleave", onMouseLeave);
      }
    };
  }, [emblaApi, isPaused]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      console.log("file", file);
      setSelectedImage(file);
      setSegmentedImage(null);
    }
  };

  // const processImageUrl = (url : string) => {

  // }

  const processImage = async () => {
    if (!selectedImage) return;
    try{
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('mode',mode);

      const res = await SegmentAPI.segment(formData) ;
      const data = res.data as segmentResponse;
      
      if (!(data.result ?? "").startsWith('http')){
        setSegmentedImage('data:image/png;base64,' + data.result)
      }


    //   if (selectedImage) {
    //     setHistory((prev) => [{ original: selectedImage, segmented: "/segmented1.png" }, ...prev])
    //   }
    // }, 2000)

    
    } catch(error){
      console.error(error)
    } finally{
      setIsProcessing(false);
    }
    
  };

  const downloadImage = () => {
     const downloadLink = document.createElement("a");
     downloadLink.href = segmentedImage ?? "";
     downloadLink.download = 'segmented_img';
     downloadLink.click();
  }

  const clearImage = () => {
    setSelectedImage(null);
    setSegmentedImage(null);
  };

  const tes = async () => {
     const { data, error } = await supabase.from('asset_bucket_relations').select();

     console.log('data', data);
     console.log('error', error);
  }

  return (
    <div className="flex flex-col min-h-screen ">
      
      <DashboardHeader />

      <Hero/>

      <main className="container mx-auto py-8 px-24 flex-grow mb-20">




      {/* <Button onClick={tes}>
        tes
      </Button> */}
        <Alert className="mb-6 border bg-background text-amber-600">
          <Info className="h-4 w-4" color="currentColor" />
          <AlertDescription className="text-amber-600">
            Upload an image of weeds to see the segmentation result. The tool
            will identify and highlight weed areas.
          </AlertDescription>
        </Alert>

        <div className="flex-row md:flex-col ">
          {/* shadow-green-600/20 */}
          <Card className="overflow-hidden shadow-lg  p-5 bg-background mb-12">
            <CardContent className="">
              <div className="py-2 px-2 to-background   flex justify-between items-center ">
                <h2 className="font-semibold ">Original Image</h2>

                <div className="flex gap-2 ">
                  <Button
                    size="sm"
                    onClick={clearImage}
                    disabled={!selectedImage}
                    className=" text-white hover:bg-red-500  bg-red-400 "
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                  <Select value={mode} onValueChange={setMode}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="binary">Binary</SelectItem>
                      <SelectItem value="multiclass">Multiclass</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={processImage}
                    disabled={!selectedImage || isProcessing}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    {isProcessing ? "Processing..." : "Process Image"}
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[300px] flex items-center justify-center border mb-9">
                {selectedImage ? (
                  <div className="">
                    <img
                      src={URL.createObjectURL(selectedImage) || "/placeholder.svg"}
                      alt="Original image"
                      className=" max-w-full object-contain p-4"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-amber-600" />
                    <p className="text-gray-400 mb-4">
                      Upload an image to begin
                    </p>
                    <Button
                      asChild
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        Select Image
                      </label>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden shadow-lg p-5 bg-background border ">
            <CardContent className="">
              <div className="py-2 px-2 to-background   flex justify-between items-center ">
                <h2 className="font-semibold ">Segmentation Result</h2>

                {segmentedImage && (
                  <Button
                  size="sm"
                  onClick={downloadImage}
                  disabled={!selectedImage || isProcessing}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  Download
                </Button>
                )}
                
              </div>  

            
             

              <div className="min-h-[300px] flex items-center justify-center border mb-9">
                {isProcessing ? (
                 <div className="text-center text-green-500 flex flex-col justify-center items-center">
                   <Loader2 className="animate-spin h-12 w-12" color="currentColor"/>
                    <p className="text-green-500">Processing image...</p>
                  </div>
                ) : segmentedImage ? (
                  <div className="">
                    <img
                      key={segmentedImage}
                      src={segmentedImage}
                      alt="Segmentation Result"
                      className="max-w-full object-contain p-4"
                    />
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <p className="text-gray-400">
                      Segmentation result will appear here
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* bekas */}


      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
