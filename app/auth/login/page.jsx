"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginUser } from "@/app/redux/slices/authSlice";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues = { email: "", password: "" };
  const validationSchema = Yup.object({
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string().min(6, "At least 6 chars").required("Required"),
  });

  const handleLogin = async (values, { setSubmitting }) => {
    try {
      const resultAction = await dispatch(loginUser(values));
      
      console.log("This is the resultAction",resultAction)
      
      if (loginUser.fulfilled.match(resultAction)) {
        // window.location.href = "/";
      } else {
        console.log("This is the error",resultAction.payload)
        toast.error(resultAction.payload || "Login failed", {
          position: "top-center",
          autoClose: 3500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.", {
        position: "top-center",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show validation errors as toast
  const handleFormikError = (errors) => {
    Object.values(errors).forEach((msg) => {
      toast.error(msg, {
        position: "top-center",
        autoClose: 3500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white p-4">
      <ToastContainer />
      <Card className="w-full max-w-md shadow-lg border border-green-100 bg-white">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-green-600 mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">K</span>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your Kaam Chaa account</CardDescription>
        </CardHeader>

        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
            validateOnBlur={false}
            validateOnChange={false}
            validate={values => {
              try {
                validationSchema.validateSync(values, { abortEarly: false });
                return {};
              } catch (err) {
                const errors = {};
                if (err.inner) {
                  err.inner.forEach(e => {
                    errors[e.path] = e.message;
                  });
                  handleFormikError(errors);
                }
                return errors;
              }
            }}
          >
            {({ isSubmitting, errors }) => (
              <Form className="space-y-4">
                {/* Email */}
                <div className="relative">
                  <Field
                    as={Input}
                    name="email"
                    type="email"
                    placeholder="Email"
                    className={`pl-10 h-11 border ${
                      errors.email ? "border-red-500" : "border-gray-200"
                    } focus:border-green-500 focus:ring-green-500`}
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <ErrorMessage name="email" component="div" className="text-xs text-red-500 ml-1" />
                  {errors.email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>

                {/* Password */}
                <div className="relative">
                  <Field
                    as={Input}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`pl-10 pr-10 h-11 border ${
                      errors.password ? "border-red-500" : "border-gray-200"
                    } focus:border-green-500 focus:ring-green-500`}
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <ErrorMessage name="password" component="div" className="text-xs text-red-500 ml-1" />
                  {errors.password && (
                    <span className="absolute right-10 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg"
                >
                  {isSubmitting ? "Signing in..." : "Login"}
                </Button>

                <div className="text-right">
                  <a href="/auth/forget-password" className="text-sm text-green-600 hover:underline">
                    Forgot Password?
                  </a>
                </div>
              </Form>
            )}
          </Formik>

          <div className="relative my-6 text-center text-xs text-gray-500">
            Or continue with your account
          </div>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <a href="/auth/register" className="text-green-600 hover:underline font-medium">
              Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}