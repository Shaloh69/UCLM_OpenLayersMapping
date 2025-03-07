import { Button } from "@heroui/button";
import { Link } from "@heroui/link";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10 ">
      Hello World of UCWays
      <div className="gap-3 col-auto">
        <Button>
          <Link showAnchorIcon color="foreground" href="/navigation">
            To Map Page
          </Link>
        </Button>
      </div>
    </section>
  );
}
