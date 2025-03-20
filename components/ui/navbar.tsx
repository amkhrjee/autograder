import { FaGithub } from "react-icons/fa6";
import { Button, buttonVariants } from "./button";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

export function Navbar() {
  return (
    <div className="flex flex-row justify-between items-center p-4 mb-2">
      <p className="text-lg font-bold">📝 Autograder</p>
      <div className="flex flex-row gap-2">
        <Link
          target="_blank"
          href={"/system-design.png"}
          className={buttonVariants({ variant: "outline" })}
        >
          Architecture <ExternalLink />
        </Link>

        <Link
          target="_blank"
          href={"https://github.com/amkhrjee/autograder"}
          className={buttonVariants({ variant: "outline" })}
        >
          <FaGithub />
        </Link>
      </div>
    </div>
  );
}
