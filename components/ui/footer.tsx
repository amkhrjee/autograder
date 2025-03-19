import { FaInfo } from "react-icons/fa6";
import { Button } from "./button";

export function Footer() {
  return (
    <Button variant={"link"}>
      <div className="flex flex-row items-center gap-2 justify-center">
        <FaInfo />
        <p>Learn more about the app architecture</p>
      </div>
    </Button>
  );
}
