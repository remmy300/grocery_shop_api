import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";

const GoogleLoginButton = () => {
  const handleSuccess = async (credentialResponse: any) => {
    try {
      const { credential } = credentialResponse;

      const user = jwtDecode(credential);
      console.log("Google User:", user);

      const response = await fetch("http://localhost:4000/api/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: credential }),
      });

      const data = await response.json();
      console.log("Backend Response:", data);

      localStorage.setItem("token", data.accessToken);

      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login Failed:", error);
    }
  };

  const handleError = () => {
    console.log("Google Login Failed");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white shadow-lg rounded-2xl text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome Back</h2>
        <p className="text-gray-600 mb-6">
          Sign in using your Google account to continue.
        </p>

        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="outline"
          size="large"
          text="signin_with"
          shape="pill"
          width="300"
        />
      </div>
    </div>
  );
};

export default GoogleLoginButton;
