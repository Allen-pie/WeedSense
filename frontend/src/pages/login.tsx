import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight ,  AlertTriangle, Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardHeader } from "@/custom_components/header";
import Footer from "@/custom_components/footer";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { supabase } from "../../supabase/supabase.ts";
import ErrorToaster from "@/custom_components/error-toaster.tsx";
import showErrorToaster from "@/custom_components/error-toaster.tsx";
import showSuccessToaster from "@/custom_components/success-toaster.tsx";

const schema = z.object({
  email: z.string().email().min(1, {
    message: "Email cannot be empty",
  }),
  password: z.string().min(1, {
    message: "Password cannot be empty",
  }),
});

type LoginData = z.infer<typeof schema>;

export default function Login() {
  const defaultValues = {
    email: "",
    password: "",
  };
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (value: LoginData) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        ...value,
      });

      if (error) {
        showErrorToaster({
          title : 'Login failed',
          description : error.message
        })
        return;
      }

      showSuccessToaster({
        title : 'Login successful'
      })


      navigate("/");
    } catch (error) {
      if (error instanceof Error) {
        toast.error("Login failed", {
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen  flex flex-col">
      <DashboardHeader />

      <main className="flex-1 flex items-center justify-center p-4 relative z-10 mb-40 mt-25 ">
        <div className="w-full max-w-md">
          <div className="relative">
            {/* glow */}
            {/* <div className="absolute -inset-0.5 bg-green-500/20 rounded-xl blur-md"></div> */}

            {/*  border-green-900 */}
            <div className="relative  rounded-xl border overflow-hidden p-6 py-10 px-7 border-outline">
              <div className="text-center mb-8">
                {/* <div className="inline-flex items-center justify-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-green-900/50 flex items-center justify-center">
                    <Leaf className="h-6 w-6 text-green-400" />
                  </div>
                </div> */}

                <h1 className="text-2xl font-bold text-foreground">Login to</h1>

                {/* <p className="text-gray-400 mt-2">Sign in to your account</p> */}
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      className="pl-10  border-green-900 focus:border-green-700 focus:ring-green-700 text-foreground"
                    />
                  </div>
                  {errors.email && (
                    <div className="text-red-500 text-sm">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <a
                      href="/forgot-password"
                      className="text-sm text-green-400 hover:text-green-300"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />

                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register("password")}
                      className="pl-10 pr-10  border-green-900 focus:border-green-700 focus:ring-green-700 text-foreground"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.password && (
                    <div className="text-red-500 text-sm">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin"/> 
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm">
                  Don't have an account?{" "}
                  <Link
                    to={'/register'}
                    className="text-green-400 hover:text-green-300"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      
    </div>
  );
}
