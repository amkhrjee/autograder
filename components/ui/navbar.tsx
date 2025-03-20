import { FaGithub } from "react-icons/fa6";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HistoryIcon, LogOutIcon } from "lucide-react";
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";

export function Navbar() {
  return (
    <div className="flex flex-row justify-between items-center p-4 mb-2">
      <p className="text-lg font-bold">📝 Autograder</p>
      <div className="flex flex-row items-center gap-2">
        <Button variant={"outline"} size={"icon"}>
          <FaGithub size={24} />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage
                src={createAvatar(lorelei, {
                  seed: "test user",
                }).toDataUri()}
              />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="mr-4">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <HistoryIcon /> History
            </DropdownMenuItem>
            <DropdownMenuItem variant="destructive">
              <LogOutIcon /> Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
