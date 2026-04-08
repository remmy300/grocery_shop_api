import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UsersPage = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-label text-secondary-foreground uppercase tracking-widest">
            Users
          </p>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Team & account management
          </h1>
        </div>
        <Button className="bg-primary text-primary-foreground px-5 py-3 rounded-full">
          Invite user
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">Active users</p>
            <p className="mt-2 text-muted-foreground">
              52 users signed in this week.
            </p>
            <div className="mt-6">
              <Badge className="bg-secondary-fixed text-on-secondary-fixed-variant">
                Active
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">
              Pending invites
            </p>
            <p className="mt-2 text-muted-foreground">
              8 invitations awaiting acceptance.
            </p>
            <div className="mt-6">
              <Badge className="bg-secondary-fixed text-on-secondary-fixed-variant">
                8 pending
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card shadow-sm">
          <CardContent className="p-8">
            <p className="text-sm font-medium text-foreground">Admin seats</p>
            <p className="mt-2 text-muted-foreground">
              3 users have admin-level access.
            </p>
            <div className="mt-6">
              <Badge className="bg-secondary-fixed text-on-secondary-fixed-variant">
                Admins
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UsersPage;
