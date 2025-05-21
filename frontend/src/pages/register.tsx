import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardHeader } from "@/custom_components/header";
import Footer from "@/custom_components/footer";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { supabase } from "../../supabase/supabase.ts";
import showErrorToaster from "@/custom_components/error-toaster.tsx";
import showSuccessToaster from "@/custom_components/success-toaster.tsx";

const schema = z
  .object({
    username: z.string().min(1, {
      message: "Name cannot be empty",
    }),
    email: z.string().email().min(1, {
      message: "Email cannot be empty",
    }),
    password: z.string().min(1, {
      message: "Password cannot be empty",
    }),
    confirm_password: z.string().min(1, {
      message: "Confirm password cannot be empty",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message:
      "The passwords you entered do not match. Please ensure they are the same",
    path: ["confirm_password"],
  });

type RegisterData = z.infer<typeof schema>;

export default function Register() {
  const defaultValues = {
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterData>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (value: RegisterData) => {
    try {
      setIsLoading(true);
      const { data, error: reg_error } = await supabase.auth.signUp({
        email: value.email,
        password: value.password,
      });

      if (reg_error) {
        showErrorToaster({
          title: "Register failed",
          description: reg_error.message,
        });
        return;
      }

      if (data.user?.id) {
        const { error: db_error } = await supabase.from("profiles").insert({
          id: data.user.id,
          username: value.username,
        });

        if (db_error) {
          showErrorToaster({
            title: "Register failed",
            description: db_error.message,
          });
          return;
        }

        showSuccessToaster({
          title: "Register successful",
        });

        navigate("/login");
      }
    } catch (error) {
      if (error instanceof Error) {
        showErrorToaster({
          title: "Register failed",
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
            <div className="relative  rounded-xl border overflow-hidden p-6 py-10 px-7 border-outline">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-foreground">Register</h1>

                <p className="text-gray-400 mt-2">Sign up to your account</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-foreground">
                    Username
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                    <Input
                      type="text"
                      placeholder="Enter your username"
                      {...register("username")}
                      className="pl-10  border-green-900 focus:border-green-700 focus:ring-green-700 text-foreground"
                    />
                  </div>
                  {errors.username && (
                    <div className="text-red-500 text-sm">
                      {errors.username.message}
                    </div>
                  )}
                </div>

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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
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

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="password" className="text-foreground">
                      Confirm Password
                    </Label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />

                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register("confirm_password")}
                      className="pl-10 pr-10  border-green-900 focus:border-green-700 focus:ring-green-700 text-foreground"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  {errors.confirm_password && (
                    <div className="text-red-500 text-sm">
                      {errors.confirm_password.message}
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" />
                      <span>Signing up...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign Up</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
