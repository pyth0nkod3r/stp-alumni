import PasswordChangeOverlay from "@/components/shared/PasswordChangeBanner";
import React from "react";

function Layout({ children }) {
  return (
    <>
      {children}
      <PasswordChangeOverlay />
    </>
  );
}

export default Layout;
