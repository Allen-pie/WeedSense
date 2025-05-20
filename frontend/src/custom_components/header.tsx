import { User, LogOut , Leaf} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// import { useAuth } from "./context/AuthContext";
import React, { useState, useEffect } from "react";
import ThemeToggle from "./theme_toggle";

export function DashboardHeader() {
//   const { signOut, session } = useAuth();

  return (
    <header className="sticky top-0 z-99 flex h-16 items-center gap-4 border-b border-outline  bg-background px-8 py-10 ">
      {/* {logoUrl ? (
        <Image src={logoUrl} width={150} height={100} alt="Jernih Logo" />
      ) : (
        <span className="h-8 w-8 mr-2 bg-white text-blue-800 font-bold flex items-center justify-center rounded">
          Jernih
        </span>
      )} */}

      <div className="flex items-center justify-center gap-3">
          <Leaf className="h-8 w-8 text-green-500" />
          <h1 className="text-3xl font-bold text-center text-green-500">
            Weed <span className="text-foreground">Sense</span>
          </h1>
    </div>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle/>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72">
              <div className="grid gap-4">
                <Button
                  className="justify-start"
                  variant="ghost"
                //   onClick={() => signOut()}
                >
                  <LogOut className="h-4 w-4" />
                  <h4 className="font-medium leading-none">Log Out</h4>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        
          <div className="flex items-center gap-2">
            <a href="/login">
              <Button variant="ghost">
                Login
              </Button>
            </a>
            <a href="/register">
              <Button>Create an account</Button>
            </a>
          </div>
        
      </div>
    </header>
  );
}
