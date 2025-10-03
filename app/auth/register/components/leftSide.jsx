import AuthLayout from "../../../global/auth-global/authlayout";
import image from "/public/placeholder-logo.png"
import RegisterServiceSeeker from '../register-service-seeker/components/main'

export default function RegisterPage() {
  return (
    <AuthLayout imageSrc={image} imageAlt="Green and white background">
      <h1 className="text-3xl font-bold text-center mb-8 text-green-700">
        Register Page
      </h1>

      <div className="flex flex-col gap-4">
        
        <RegisterServiceSeeker/>
        
      </div>
    </AuthLayout>
  );
}
