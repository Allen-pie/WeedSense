import React, { createContext, useContext, useEffect, useState } from "react";
import { type Session, type User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import {supabase} from "../../supabase/supabase.ts";
interface AuthContextType {
    user : User | null;
    session : Session | null;
    loading : boolean;
    signOut : () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children} : {children : React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, isLoading] = useState<boolean>(true);

    const navigate = useNavigate();

    useEffect(() => {
        const getSession = async () => {
            const {data, error} = await supabase.auth.getSession();
            if (data.session){
                setUser(data.session.user);
                setSession(data.session);
            }
            else{
                console.error('error', error);
            }

            isLoading(false);
        }

        getSession();

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user || null);
          });
      
          return () => {
            listener.subscription.unsubscribe();
          };

    }, [])


    const signOut = async () =>{
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        navigate('/login');
    }   

    return (
        <AuthContext.Provider value={{user, session, loading, signOut}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
};
  

