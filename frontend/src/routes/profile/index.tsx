import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const ProfilePage = () => {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-label text-secondary-foreground uppercase tracking-widest">
            Profile
          </p>
          <h1 className="text-4xl font-heading font-extrabold tracking-tighter text-foreground">
            Personal information
          </h1>
        </div>
      </div>

      <Card className="bg-card shadow-sm">
        <CardContent className="p-8 space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src="https://lh3.googleusercontent.com/aida-public/AB6AXuAUGtdq4yd70eA3Cu5s0XxyEWWSdkqxT190MUuX98wku5HaJBuB5ZOJTCX9SMq1j2zd9kqd1UuR6q1vT5eWnAZPFLNTWizE9irpxQtoK9569dv3Qv9gjgT3Sh85y0N2YP33Ph_z6mY8o2aN38TF1whFG-TxL16D5c0g2MEQ1lmpdZW5MFRNkeEO1GQf5mIYduX7sOowAqdAgich9c1s8hJ-cW7-ySbL5ESw3ZSo-eV0ERAE6XkLxjNlYZ0ZgQ4S2gd_AWP2p_OcmLk" />
              <AvatarFallback>AA</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-bold text-foreground">Alex Mercer</p>
              <p className="text-sm text-muted-foreground">Head Archivist</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Input
              className="bg-card border-none focus:ring-1 focus:ring-primary/20"
              placeholder="Display name"
            />
            <Input
              className="bg-card border-none focus:ring-1 focus:ring-primary/20"
              placeholder="Email address"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-primary text-primary-foreground px-5 py-3 rounded-full">
              Save profile
            </Button>
            <Button variant="outline" className="px-5 py-3 rounded-full">
              Change password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
