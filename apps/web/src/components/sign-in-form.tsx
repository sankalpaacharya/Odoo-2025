import { authClient } from "@/lib/auth-client";
import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";
import z from "zod";
import Loader from "./loader";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useRouter } from "next/navigation";

export default function SignInForm({
  onSwitchToSignUp,
}: {
  onSwitchToSignUp: () => void;
}) {
  const router = useRouter();
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      emailOrEmployeeId: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      try {
        let email = value.emailOrEmployeeId;

        // If it's not an email (no @), look up the employee code first
        if (!value.emailOrEmployeeId.includes("@")) {
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3000"
            }/api/employee-lookup`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                employeeCode: value.emailOrEmployeeId.toUpperCase(),
              }),
            }
          );

          if (!response.ok) {
            throw new Error("Employee not found");
          }

          const data = await response.json();
          email = data.email;
        }

        // Now sign in with Better Auth using the email
        await authClient.signIn.email(
          {
            email,
            password: value.password,
          },
          {
            onSuccess: () => {
              toast.success("Sign in successful");
              router.push("/dashboard");
            },
            onError: (error) => {
              throw new Error(error.error.message || "Login failed");
            },
          }
        );
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Login failed");
      }
    },
    validators: {
      onSubmit: z.object({
        emailOrEmployeeId: z
          .string()
          .min(1, "Email or Employee ID is required"),
        password: z.string().min(1, "Password is required"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="mx-auto w-full mt-6 sm:mt-10 max-w-md px-4 sm:px-6 py-4 sm:py-6">
      <h1 className="mb-4 sm:mb-6 text-center text-2xl sm:text-3xl font-bold">
        Welcome Back
      </h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <div>
          <form.Field name="emailOrEmployeeId">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Email or Employee ID</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="e.g., john@company.com or ODJODE20250001"
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500 text-sm">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name}>Password</Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="text-red-500">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe>
          {(state) => (
            <Button
              type="submit"
              className="w-full"
              disabled={!state.canSubmit || state.isSubmitting}
            >
              {state.isSubmitting ? "Submitting..." : "Sign In"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-4 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="text-indigo-600 hover:text-indigo-800"
        >
          Need an account? Sign Up
        </Button>
      </div>
    </div>
  );
}
