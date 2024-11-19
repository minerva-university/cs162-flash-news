import React, { useState } from "react";
import LoginForm from "../forms/LoginForm";
import SignUpForm from "../forms/SignUpForm";
import ResetPasswordForm from "../forms/ResetPasswordForm";

const AuthPage = () => {
  const [formType, setFormType] = useState("login");

  const renderForm = () => {
    switch (formType) {
      case "login":
        return <LoginForm />;
      case "signup":
        return <SignUpForm />;
      case "resetPassword":
        return <ResetPasswordForm />;
      default:
        return <LoginForm />;
    }
  };

  return (
    <div>
      <div>
        {/* @TODO: Prettify this */}
        <button onClick={() => setFormType("login")}>Login</button>
        <button onClick={() => setFormType("signup")}>Sign Up</button>
        <button onClick={() => setFormType("resetPassword")}>
          Reset Password
        </button>
      </div>
      {renderForm()}
    </div>
  );
};

export default AuthPage;
