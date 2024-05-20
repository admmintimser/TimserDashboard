import React, { useContext, useState } from "react";
import { TiHome } from "react-icons/ti";
import { RiLogoutBoxFill } from "react-icons/ri";
import { GiHamburgerMenu } from "react-icons/gi";
import { MdAddModerator } from "react-icons/md";
import { MdOutlineAutoGraph } from "react-icons/md";
import { FaUserNurse } from "react-icons/fa6";
import { FaFlaskVial } from "react-icons/fa6";
import { FaPeopleGroup } from "react-icons/fa6";
import { GrUserAdd } from "react-icons/gr";
import { LuLayoutDashboard } from "react-icons/lu";
import { RiDashboard2Fill } from "react-icons/ri";
import { TfiDashboard } from "react-icons/tfi";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [show, setShow] = useState(false);

  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const handleLogout = async () => {
    await axios
      .get("https://webapitimser.azurewebsites.net/api/v1/user/admin/logout", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,  // Include the authorization token
        }
      })
      .then((res) => {
        toast.success(res.data.message);
        setIsAuthenticated(false);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const navigateTo = useNavigate();

  const gotoHomePage = () => {
    navigateTo("/");
    setShow(!show);
  };
  const gotoDoctorsPage = () => {
    navigateTo("/doctors");
    setShow(!show);
  };
  const gotoFlebosPage = () => {
    navigateTo("/flebos");
    setShow(!show);
  };
  const gotoMessagesPage = () => {
    navigateTo("/messages");
    setShow(!show);
  };
  const gotoAddNewDoctor = () => {
    navigateTo("/doctor/addnew");
    setShow(!show);
  };
  const gotoAddNewAdmin = () => {
    navigateTo("/admin/addnew");
    setShow(!show);
  };
  const gotoAddNewFleb = () => {
    navigateTo("/flebo/addnew");
    setShow(!show);
  };
  const gotoInforme = () => {
    navigateTo("/data-for-dashboard");
    setShow(!show);
  };
  const gotoInformeClient = () => {
    navigateTo("/dashclient");
    setShow(!show);
  };
  const gotoElisas = () => {
    navigateTo("/elisas");
    setShow(!show);
  };
  const gotoWesternBLot = () => {
    navigateTo("/westernblot");
    setShow(!show);
  };

  return (
    <>
      <nav
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
        className={show ? "show sidebar" : "sidebar"}
      >
        <div className="links">
          <TiHome onClick={gotoHomePage} />
          <MdOutlineAutoGraph onClick={gotoInforme}/>
          <LuLayoutDashboard onClick={gotoInformeClient}/>
          <FaPeopleGroup onClick={gotoDoctorsPage} />
          <FaFlaskVial  onClick={gotoFlebosPage} />
          <RiDashboard2Fill   onClick={gotoWesternBLot} />
          <TfiDashboard   onClick={gotoElisas} />
          <MdAddModerator onClick={gotoAddNewAdmin} />
          <FaUserNurse  onClick={gotoAddNewFleb} />
          <GrUserAdd  onClick={gotoAddNewDoctor} />
          {/* <AiFillMessage onClick={gotoMessagesPage} /> */}
          <RiLogoutBoxFill onClick={handleLogout} />
        </div>
      </nav>
      <div
        className="wrapper"
        style={!isAuthenticated ? { display: "none" } : { display: "flex" }}
      >
        <GiHamburgerMenu className="hamburger" onClick={() => setShow(!show)} />
      </div>
    </>
  );
};

export default Sidebar;
