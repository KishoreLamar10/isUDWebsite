import LoginForm from "@/components/LoginForm";
import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Top Banner / Legal Text */}
      <div className="bg-slate-50 border-b border-slate-100 py-4 px-4 sm:px-6 lg:px-8 text-center text-[13px] text-slate-600 font-medium">
        By creating an account, you agree to the <span className="text-primary hover:underline cursor-pointer">Terms of Service</span> and <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span> © 2024 University at Buffalo. All rights reserved.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col lg:flex-row gap-16 xl:gap-24">
          
          {/* Left Column: Login */}
          <div className="lg:w-1/3 lg:border-r lg:border-slate-100 lg:pr-16 xl:pr-24">
            <LoginForm />
          </div>

          {/* Right Column: Register */}
          <div className="lg:w-2/3">
            <RegisterForm />
          </div>
          
        </div>
      </div>
    </div>
  );
}
