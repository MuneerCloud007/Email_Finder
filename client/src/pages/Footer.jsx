import React from 'react'
import { Typography } from "@material-tailwind/react";


export default function Footer() {
  return (
    <footer className="flex h-[10%] flex-row flex-wrap items-center justify-center gap-y-6 gap-x-12 border-t border-blue-gray-50 py-6 text-center md:justify-between px-4">
    <Typography color="blue-gray" className="font-normal">
      &copy; VIVA LA SALES
    </Typography>
    <ul className="flex flex-wrap items-center gap-y-2 gap-x-8">
      <li>
        <Typography
          as="a"
          href="#"
          color="blue-gray"
          className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
        >
          About Us
        </Typography>
      </li>
      <li>
        <Typography
          as="a"
          href="#"
          color="blue-gray"
          className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
        >
          License
        </Typography>
      </li>
      <li>
        <Typography
          as="a"
          href="#"
          color="blue-gray"
          className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
        >
          Contribute
        </Typography>
      </li>
      <li>
        <Typography
          as="a"
          href="#"
          color="blue-gray"
          className="font-normal transition-colors hover:text-blue-500 focus:text-blue-500"
        >
          Contact Us
        </Typography>
      </li>
    </ul>
  </footer>
  )
}