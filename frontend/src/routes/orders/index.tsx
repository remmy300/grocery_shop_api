import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const OrdersPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-label text-secondary-foreground uppercase tracking-widest">
            Orders
          </p>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Recent purchases
          </h1>
        </div>
        <Button className="bg-primary text-primary-foreground px-5 py-3 rounded-full">
          Export orders
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">
              Pending shipments
            </p>
            <p className="mt-2 text-muted-foreground">
              12 orders waiting to be packed.
            </p>
            <div className="mt-6">
              <Badge className="bg-secondary-fixed text-on-secondary-fixed-variant">
                12 pending
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">
              Fulfilled today
            </p>
            <p className="mt-2 text-muted-foreground">34 dispatched orders.</p>
            <div className="mt-6">
              <Badge className="bg-secondary-fixed text-on-secondary-fixed-variant">
                34 shipped
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">Returns</p>
            <p className="mt-2 text-muted-foreground">5 returns in review.</p>
            <div className="mt-6">
              <Badge className="bg-secondary-fixed text-on-secondary-fixed-variant">
                5 open
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrdersPage;
