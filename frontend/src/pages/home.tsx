import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Trash2, Info, Loader2, Download, History } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useEmblaCarousel from "embla-carousel-react";
import Footer from "@/custom_components/footer";
import { DashboardHeader } from "@/custom_components/header";
import SegmentAPI from "../../apis/SegmentAPI";
import { supabase } from "../../supabase/supabase.ts";
import { PUBLIC_URL } from "../../supabase/bucket_url.ts";
import Hero from "@/custom_components/hero.tsx";
import { Select } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";import { useAuth } from "@/custom_components/auth_context.tsx";
import { decode } from "base64-arraybuffer";
import clsx from "clsx";
import showErrorToaster from "@/custom_components/error-toaster.tsx";

interface segmentResponse {
  message: string;
  result: string;
}

interface Assets {
  id: number;
  created_at?: string;
  url_bucket: string;
}

interface UserHistory {
  id: number;
  original: Assets;
  segmented: Assets;
}

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [segmentedImage, setSegmentedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isLoadingUserData, setIsLoadingUserData] = useState<boolean>(false);
  const [mode,setMode] = useState<string>('binary');

  const { session, user } = useAuth();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });

  const [history, setHistory] = useState<UserHistory[]>([]);

  const scrollToTool = () => {
    const toolSection = document.getElementById("tool-section");
    if (toolSection) {
      toolSection.scrollIntoView({ behavior: "smooth" });
    }
  };

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

    const carousel = (emblaRef as any).current;
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
       if (file.type === "image/jpeg" || file.type === "image/png") {
        setSelectedImage(file);
        setSegmentedImage(null);
      }else {
        showErrorToaster({
          title : 'Invalid file type. Only JPG and PNG are allowed.'
        })
        return;
      }

    }
  };

  const uploadSegmentedImageToSupabase = async (base64?: string) => {
    if (!base64) return null;

    const { data, error } = await supabase.storage
      .from("segmentedimages")
      .upload(`${Date.now()}-segmented_img.png`, decode(base64), {
        contentType: "image/png",
      });

    const { data: db_data, error: db_error } = await supabase
      .from("segmented_assets")
      .insert({
        url_bucket: data!.fullPath,
      })
      .select();

    if (error) {
      console.error("Upload Segmented Image Failed: ", error.message);
      return null;
    } else {
      console.log("Upload Segmented Image Success: ", data);
    }

    if (db_error) {
      console.error("Saving Segmented Image to DB Failed: ", db_error.message);
      return null;
    }

    const asset_result: Assets[] = db_data!;

    return asset_result[0].id;
  };

  const uploadOriginalImageToSupabase = async (original?: File) => {
    if (!original) return null;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(`${Date.now()}-${original.name}`, original, {
        cacheControl: "3600",
        upsert: false,
      });

    const { data: db_data, error: db_error } = await supabase
      .from("original_assets")
      .insert({
        url_bucket: data!.fullPath,
      })
      .select();

    if (error) {
      console.error("Upload Image Failed: ", error.message);
      return null;
    } else {
      console.log("Upload Image Success: ", data);
    }

    if (db_error) {
      console.error("Saving Original Image to DB Failed: ", db_error.message);
      return null;
    }

    const asset_result: Assets[] = db_data!;

    return asset_result[0].id;
  };

  const processImage = async () => {
    if (!selectedImage) return;
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('mode',mode);

      const res = await SegmentAPI.segment(formData);
      const data = res.data as segmentResponse;

      setSegmentedImage("data:image/png;base64," + data.result);

      if (session) {
        const ori_id = await uploadOriginalImageToSupabase(selectedImage);
        const seg_id = await uploadSegmentedImageToSupabase(data.result);

        if (!ori_id || !seg_id) return;

        const { data: db_data, error: db_error } = await supabase
          .from("original_segmented_relations")
          .insert({
            original_id: ori_id,
            segmented_id: seg_id,
            user_id: user?.id,
          })
          .select();

        if (db_error) {
          console.error("Saving Relations to DB Failed: ", db_error.message);
          return;
        }

        getUserSegmentationHistory();
      }

      //   if (selectedImage) {
      //     setHistory((prev) => [{ original: selectedImage, segmented: "/segmented1.png" }, ...prev])
      //   }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (url: string, file_name = "segmented_img") => {
    const downloadLink = document.createElement("a");
    downloadLink.href = url ?? "";
    downloadLink.download = file_name;
    downloadLink.click();
  };



  const downloadBothImages = async (ori_url: string, seg_url: string) => {
    await downloadFromSupabase(ori_url);
    await downloadFromSupabase(seg_url);
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSegmentedImage(null);
  };

  const getUserSegmentationHistory = async () => {
    setIsLoadingUserData(true);
    const { data, error } = await supabase
      .from("original_segmented_relations")
      .select(
        `
    id,
    original:original_id (
      id,
      url_bucket
    ),
    segmented:segmented_id (
      id,
      url_bucket
    )
  `
      )
      .eq("user_id", user?.id);

    const user_data: UserHistory[] = data!;
    setHistory(user_data);
    setIsLoadingUserData(false);
  };

  const downloadFromSupabase = async (url: string) => {
    const parts = url.split("/");

    const folder = parts[0];
    const filename = parts[1];

    const { data, error } = await supabase.storage
      .from(folder)
      .download(filename);

    if (error){   
      showErrorToaster({
        title : 'Error downloading image',
        description : error.message
      })
      return;
    }

    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } 

  };
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  useEffect(() => {
    if (session && !hasFetched) {
      getUserSegmentationHistory();
      setHasFetched(true);
    }
  }, [session, hasFetched]);

  return (
    <div className="flex flex-col min-h-screen ">
      <DashboardHeader />

      <Hero />

      <main
        className="container mx-auto py-8 px-24 flex-grow mb-20"
        id="tool-section"
      >
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
                    className=" text-white hover:bg-red-500  bg-red-400 cursor-pointer"
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
                    disabled={
                      !selectedImage || isProcessing || segmentedImage != null
                    }
                    className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                  >
                    {isProcessing ? "Processing..." : "Process Image"}
                  </Button>
                </div>
              </div>

              <div className="relative min-h-[300px] flex items-center justify-center border mb-9">
                {selectedImage ? (
                  <div className="">
                    <img
                      src={
                        URL.createObjectURL(selectedImage) || "/placeholder.svg"
                      }
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
                      className="bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                    >
                      <label>
                        <input
                          type="file"
                          accept="image/jpeg,image/png"
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
                    onClick={() => downloadImage(segmentedImage)}
                    disabled={!selectedImage || isProcessing}
                    className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              <div className="min-h-[300px] flex items-center justify-center border mb-9">
                {isProcessing ? (
                  <div className="text-center text-green-500 flex flex-col justify-center items-center">
                    <Loader2
                      className="animate-spin h-12 w-12"
                      color="currentColor"
                    />
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
      </main>

      {session ? (
        isLoadingUserData ? (
          <section className="mb-24 flex flex-col items-center justify-center py-28 px-4 border-t border-b border-outline">
            <div className="text-center text-green-500 flex flex-col justify-center items-center">
              <Loader2
                className="animate-spin h-12 w-12 mb-2"
                color="currentColor"
              />
              <p className="text-green-500">Loading user history...</p>
            </div>
          </section>
        ) : history.length > 0 ? (
          <section className="mb-36">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline to-transparent"></div>
              <h2 className="text-2xl font-bold text-green-400">
                Segmentation History
              </h2>
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-outline to-transparent"></div>
            </div>

            <section className="relative ">
              <div
                className="w-full overflow-hidden"
                ref={history.length > 3 ? emblaRef : null}
              >
                <div
                  className={clsx(
                    "flex",
                    history.length <= 3 && "justify-center"
                  )}
                >
                  {history.map((item, index) => (
                    <div
                      key={index}
                      className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
                    >
                      <Card className=" border-green-900/50 mr-4">
                        <CardContent className="p-0">
                          <div className="grid grid-cols-2 h-full">
                            <div className="relative h-[200px] border-r border-green-900/50">
                              <img
                                src={PUBLIC_URL + item.original.url_bucket}
                                alt={`Original image ${index}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="relative h-[200px]">
                              <img
                                src={PUBLIC_URL + item.segmented.url_bucket}
                                alt={`Segmented image ${index}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </CardContent>
                        <Button
                          size="sm"
                          onClick={() =>
                            downloadBothImages(
                              item.original.url_bucket,
                              item.segmented.url_bucket
                            )
                          }
                          className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </Card>
                    </div>
                  ))}

                  {/* Duplicate the first few items to create a seamless loop effect */}

                  {history.length > 3 &&
                    history.slice(0, 3).map((item, index) => (
                      <div
                        key={`duplicate-${index}`}
                        className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.333%] pl-4"
                      >
                        <Card className=" border-outline mr-4">
                          <CardContent className="p-0">
                            <div className="grid grid-cols-2 h-full">
                              <div className="relative h-[200px] border-r border-outline">
                                <img
                                  src={PUBLIC_URL + item.original.url_bucket}
                                  alt={`Original image ${index}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="relative h-[200px]">
                                <img
                                  src={PUBLIC_URL + item.segmented.url_bucket}
                                  alt={`Segmented image ${index}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </CardContent>

                          <Button
                            size="sm"
                            onClick={() =>
                              downloadBothImages(
                                item.original.url_bucket,
                                item.segmented.url_bucket
                              )
                            }
                            className="bg-green-500 hover:bg-green-600 text-white cursor-pointer"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </Card>
                      </div>
                    ))}
                </div>
              </div>

              {history.length > 3 && (
                <>
                  <button
                    className="absolute left-2 top-1/2 -translate-y-1/2 hover:bg-green-900/30 text-green-400 border border-outline rounded-full p-2 z-10 cursor-pointer"
                    onClick={() => scrollPrev()}
                  >
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
                      className="h-4 w-4"
                    >
                      <path d="m15 18-6-6 6-6" />
                    </svg>
                  </button>

                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2  hover:bg-green-900/30 text-green-400 border border-outline rounded-full p-2 z-10 cursor-pointer"
                    onClick={() => scrollNext()}
                  >
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
                      className="h-4 w-4"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </>
              )}
            </section>
          </section>
        ) : (
          <section className="mb-24 flex flex-col items-center justify-center py-28 px-4 border-t border-b border-outline">
            <div className="text-center max-w-md mx-auto">
              <div className="inline-flex items-center justify-center mb-6 p-3   ">
                <History className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-4">
                No Segmentation History
              </h2>
              <p className="text-foreground mb-6">
                You haven't segmented any images yet. Try the segmentation tool
                above to get started.
              </p>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white px-8 cursor-pointer"
                onClick={scrollToTool}
              >
                Try Segmentation Tool
              </Button>
            </div>
          </section>
        )
      ) : (
        <section className="mb-24 flex flex-col items-center justify-center py-28 px-4 border-t border-b border-outline">
          <div className="text-center max-w-md mx-auto">
            <div className="inline-flex items-center justify-center mb-6 p-3   ">
              <Info className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">
              Segmentation History
            </h2>
            <p className="text-foreground mb-6">
              Segmentation history is only saved when you're logged in
            </p>
            <Link to="/login">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 cursor-pointer">
                Login now
              </Button>
            </Link>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
