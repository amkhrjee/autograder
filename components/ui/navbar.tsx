import { FaGithub } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";

export function Navbar() {
  return (
    <div className="flex flex-row justify-between items-center p-4 mb-2">
      <p className="text-lg font-bold">autograder</p>
      <div className="flex flex-row items-center gap-2">
        <Button variant={"outline"} size={"icon"}>
          <FaGithub size={24} />
        </Button>
        <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
