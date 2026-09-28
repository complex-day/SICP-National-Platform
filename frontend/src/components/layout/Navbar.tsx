"use client";

import React from "react";
import { GovNavbar } from "./GovNavbar";

export interface NavbarProps {
  onOpenMobileMenu?: () => void;
}

export function Navbar(props: NavbarProps) {
  return <GovNavbar />;
}
