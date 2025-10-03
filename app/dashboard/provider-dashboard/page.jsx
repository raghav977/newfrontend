// import React from 'react'
"use client"
import { useEffect } from "react"

const page = () => {

  const fetchAboutMe = async()=>{
    try{
      const response = await fetch("http://localhost:3024/user/about");
      const data = await response.json();
      console.log("This is data",data);

    }
    catch(err){
      console.log("This is error");

    }
  }

  useEffect(()=>{
    fetchAboutMe();
  })
  return (
    <div>
      {/*  */}

    </div>
  )
}

export default page