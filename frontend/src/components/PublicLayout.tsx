import { Outlet } from "react-router-dom";
import PublicNavbar from "./PublicNavbar";

export default function PublicLayout() {
  return (
    <>
      <PublicNavbar />
        <>
        <PublicNavbar />
        <Outlet />
        </>
    </>
  );
}
