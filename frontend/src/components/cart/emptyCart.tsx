import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

const EmptyCart = () => {
  return (
    <Card className="rounded-[28px] border-none">
      <CardContent className="flex flex-col items-center justify-center py-24 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
          <ShoppingBag className="h-10 w-10 text-muted-foreground" />
        </div>

        <h2 className="mt-6 text-2xl font-bold">Your archive is empty</h2>

        <p className="mt-2 max-w-md text-muted-foreground">
          Curate your collection with premium seasonal products and regenerative
          harvest selections.
        </p>

        <Button asChild className="mt-8 rounded-full px-8">
          <Link href="/products">Browse products</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default EmptyCart;
