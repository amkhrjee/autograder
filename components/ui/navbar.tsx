import { SignedIn, UserButton } from "@clerk/nextjs";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa6";
import { buttonVariants } from "./button";

export function Navbar() {
  return (
    <div className="flex flex-row justify-between items-center p-4 mb-2">
      <p className="text-lg font-bold">📝 autograder</p>
      <div className="flex flex-row gap-2">
        <Link
          target="_blank"
          href={"/system-design.png"}
          className={buttonVariants({ variant: "outline" })}
        >
          architecture <ExternalLink />
        </Link>

        <Link
          target="_blank"
          href={"https://github.com/amkhrjee/autograder"}
          className={buttonVariants({ variant: "outline" })}
        >
          <FaGithub />
        </Link>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </div>
  );
}
